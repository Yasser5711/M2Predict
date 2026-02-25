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
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from tqdm import tqdm

ROOT = Path(__file__).resolve().parents[2]  # apps/ml/
DATA_PATH = ROOT / "training" / "data" / "clean.parquet"

ARTIFACTS_DIR = ROOT / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "dvf_price_m2_pipeline_rf.joblib"
META_PATH = ARTIFACTS_DIR / "metadata_rf.json"


def main() -> None:
    pbar = tqdm(total=6, desc="train_rf", unit="step")

    # 1 — Chargement données
    pbar.set_postfix_str("Chargement données")
    df = pd.read_parquet(DATA_PATH)

    df["departement"] = (
        df["code_postal"]
        .astype(str)
        .str.zfill(5)
        .str[:2]
    )

    X = df[[
        "departement",
        "surface_reelle_bati",
        "nombre_pieces_principales",
        "type_local",
    ]].copy()
    y = df["prix_m2"].astype(float)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    pbar.update(1)

    # 2 — Preprocessing pipeline
    pbar.set_postfix_str("Preprocessing pipeline")
    cat_features = ["departement", "type_local"]
    num_features = ["surface_reelle_bati", "nombre_pieces_principales"]
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("ohe", OneHotEncoder(handle_unknown="ignore")),
            ]), cat_features),
            ("num", Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="median")),
            ]), num_features),
        ],
        remainder="drop",
    )
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=18,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    pipe = Pipeline(steps=[
        ("preprocess", preprocessor),
        ("model", model),
    ])
    pbar.update(1)

    # 3 — Entraînement
    pbar.set_postfix_str("Entraînement")
    pipe.fit(X_train, y_train)
    pbar.update(1)

    # 4 — Évaluation
    pbar.set_postfix_str("Évaluation")
    preds = pipe.predict(X_test)
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    mae = float(mean_absolute_error(y_test, preds))
    pbar.update(1)

    # 5 — Sauvegarde modèle
    pbar.set_postfix_str("Sauvegarde modèle")
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipe, MODEL_PATH)
    pbar.update(1)

    # 6 — Sauvegarde métadonnées
    pbar.set_postfix_str("Sauvegarde métadonnées")
    meta = {
        "model": "RandomForestRegressor",
        "target": "prix_m2",
        "features": list(X.columns),
        "rows_total": int(len(df)),
        "rows_train": int(len(X_train)),
        "rows_test": int(len(X_test)),
        "rmse": rmse,
        "mae": mae,
    }
    META_PATH.write_text(json.dumps(
        meta, ensure_ascii=False, indent=2), encoding="utf-8")
    pbar.update(1)

    pbar.close()

    print("✅ Saved:", MODEL_PATH)
    print("📄 Meta:", META_PATH)
    print("RMSE €/m²:", rmse)
    print("MAE  €/m²:", mae)

    sample = pd.DataFrame([{
        "departement": "75",
        "surface_reelle_bati": 42,
        "nombre_pieces_principales": 2,
        "type_local": "Appartement",
    }])
    print("Sample prix_m2:", float(pipe.predict(sample)[0]))


if __name__ == "__main__":
    main()
