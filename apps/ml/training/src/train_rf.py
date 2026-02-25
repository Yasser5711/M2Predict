from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import KFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from tqdm import tqdm

ROOT = Path(__file__).resolve().parents[2]  # apps/ml/
DATA_PATH = ROOT / "training" / "data" / "clean.parquet"

MODEL_VERSION = "v1_rf_te"

ARTIFACTS_DIR = ROOT / "artifacts" / "models" / MODEL_VERSION
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
META_PATH = ARTIFACTS_DIR / "metadata.json"
TE_PATH = ARTIFACTS_DIR / "target_encoding.json"


def target_encode_oof(
    train_df: pd.DataFrame,
    col: str,
    target: str,
    n_splits: int = 5,
    smoothing: float = 20.0,
    random_state: int = 42,
) -> tuple[pd.Series, dict[str, float], float]:
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    global_mean = float(train_df[target].mean())

    oof = pd.Series(index=train_df.index, dtype=float)

    for tr_idx, val_idx in kf.split(train_df):
        tr = train_df.iloc[tr_idx]
        val = train_df.iloc[val_idx]

        stats = tr.groupby(col)[target].agg(["mean", "count"])
        smoothed = (stats["mean"] * stats["count"] +
                    global_mean * smoothing) / (stats["count"] + smoothing)

        oof.iloc[val_idx] = val[col].map(
            smoothed).fillna(global_mean).astype(float)

    stats_full = train_df.groupby(col)[target].agg(["mean", "count"])
    mapping_full = ((stats_full["mean"] * stats_full["count"] + global_mean * smoothing) /
                    (stats_full["count"] + smoothing)).to_dict()

    return oof, mapping_full, global_mean


def main() -> None:
    pbar = tqdm(total=7, desc="train_rf", unit="step")

    # 1 — Chargement données
    pbar.set_postfix_str("Chargement données")
    df = pd.read_parquet(DATA_PATH)

    df["departement"] = df["code_postal"].astype(str).str.zfill(5).str[:2]

    X = df[[
        "code_postal",
        "departement",
        "surface_reelle_bati",
        "nombre_pieces_principales",
        "type_local",
    ]].copy()
    y = df["prix_m2"].astype(float)

    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    pbar.update(1)

    # 2 — Target Encoding (safe)
    pbar.set_postfix_str("Target encoding code_postal")
    train_tmp = X_train_raw.copy()
    train_tmp["prix_m2"] = y_train.values

    cp_te_train, cp_map, global_mean = target_encode_oof(
        train_df=train_tmp,
        col="code_postal",
        target="prix_m2",
        n_splits=5,
        smoothing=20.0,
        random_state=42,
    )

    X_train = X_train_raw.copy()
    X_test = X_test_raw.copy()

    X_train["cp_te"] = cp_te_train.values
    X_test["cp_te"] = X_test["code_postal"].map(
        cp_map).fillna(global_mean).astype(float)

    X_train = X_train.drop(columns=["code_postal"])
    X_test = X_test.drop(columns=["code_postal"])
    pbar.update(1)

    # 3 — Preprocessing pipeline
    pbar.set_postfix_str("Preprocessing pipeline")
    cat_features = ["departement", "type_local"]
    num_features = ["surface_reelle_bati",
                    "nombre_pieces_principales", "cp_te"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("ohe", OneHotEncoder(handle_unknown="ignore")),  # sparse ok for RF
            ]), cat_features),
            ("num", Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="median")),
            ]), num_features),
        ],
        remainder="drop",
    )

    model = RandomForestRegressor(
        n_estimators=400,
        max_depth=20,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    pipe = Pipeline(steps=[
        ("preprocess", preprocessor),
        ("model", model),
    ])
    pbar.update(1)

    # 4 — Entraînement
    pbar.set_postfix_str("Entraînement")
    pipe.fit(X_train, y_train)
    pbar.update(1)

    # 5 — Évaluation
    pbar.set_postfix_str("Évaluation")
    preds = pipe.predict(X_test)
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    mae = float(mean_absolute_error(y_test, preds))
    pbar.update(1)

    # 6 — Sauvegarde modèle + mapping TE
    pbar.set_postfix_str("Sauvegarde modèle + TE")
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipe, MODEL_PATH)

    # même fichier TE que HGB (même mapping), ok
    te_payload = {
        "col": "code_postal",
        "smoothing": 20.0,
        "global_mean": global_mean,
        "mapping": cp_map,
    }
    TE_PATH.write_text(json.dumps(
        te_payload, ensure_ascii=False), encoding="utf-8")
    pbar.update(1)

    # 7 — Sauvegarde métadonnées
    pbar.set_postfix_str("Sauvegarde métadonnées")
    meta = {
        "model": "RandomForestRegressor",
        "target": "prix_m2",
        "features": list(X_train.columns),
        "rows_total": int(len(df)),
        "rows_train": int(len(X_train)),
        "rows_test": int(len(X_test)),
        "rmse": rmse,
        "mae": mae,
        "target_encoding_file": str(TE_PATH),
    }
    META_PATH.write_text(json.dumps(
        meta, ensure_ascii=False, indent=2), encoding="utf-8")
    pbar.update(1)

    pbar.close()

    print("✅ Saved:", MODEL_PATH)
    print("🧩 TE mapping:", TE_PATH)
    print("📄 Meta:", META_PATH)
    print("RMSE €/m²:", rmse)
    print("MAE  €/m²:", mae)

    # Quick inference demo (simulate FastAPI)
    sample = pd.DataFrame([{
        "code_postal": "75011",
        "surface_reelle_bati": 42,
        "nombre_pieces_principales": 2,
        "type_local": "Appartement",
    }])
    sample["departement"] = sample["code_postal"].astype(
        str).str.zfill(5).str[:2]
    sample["cp_te"] = sample["code_postal"].map(
        cp_map).fillna(global_mean).astype(float)
    sample = sample.drop(columns=["code_postal"])

    print("Sample prix_m2:", float(pipe.predict(sample)[0]))


if __name__ == "__main__":
    main()
