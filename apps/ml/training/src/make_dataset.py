from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from tqdm import tqdm

ROOT = Path(__file__).resolve().parents[2]  # apps/ml/
RAW_PATH = ROOT / "training" / "data" / \
    "raw" / "dvf_2025.txt"   # <-- adapte le nom
OUT_PATH = ROOT / "training" / "data" / "clean.parquet"
REPORT_PATH = ROOT / "training" / "data" / "clean_report.json"


# Colonnes attendues dans ton extrait
COL_DOC_ID = "Identifiant de document"
COL_DATE = "Date mutation"
COL_TYPE_LOCAL = "Type local"
COL_CP = "Code postal"
COL_SURFACE = "Surface reelle bati"
COL_PIECES = "Nombre pieces principales"
COL_VALEUR = "Valeur fonciere"


def to_float_fr(series: pd.Series) -> pd.Series:
    """Convertit une colonne string avec décimales françaises en float.
    Ex: "468000,00" -> 468000.0
    """
    s = series.astype(str).str.replace("\xa0", "", regex=False).str.strip()
    s = s.replace({"": None, "nan": None, "None": None})
    s = s.str.replace(",", ".", regex=False)
    return pd.to_numeric(s, errors="coerce")


def to_int(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").astype("Int64")


def main() -> None:
    if not RAW_PATH.exists():
        raise FileNotFoundError(f"Fichier introuvable: {RAW_PATH}")

    step_names = [
        "Lecture CSV",
        "Cast types",
        "Filtrage type local",
        "Filtrage valeurs",
        "Calcul prix/m²",
        "Filtrage pièces",
        "Suppression outliers",
        "Colonnes finales",
        "Sauvegarde parquet",
    ]
    pbar = tqdm(total=len(step_names), desc="make_dataset", unit="step")

    # 1 — Lecture DVF txt | (on laisse tout en string au départ)
    pbar.set_postfix_str(step_names[0])
    df_raw = pd.read_csv(
        RAW_PATH,
        sep="|",
        dtype=str,
        low_memory=False,
        encoding="utf-8",
    )
    raw_rows = len(df_raw)
    df = df_raw.copy()
    df.columns = [c.strip() for c in df.columns]
    required = [COL_DOC_ID, COL_DATE, COL_TYPE_LOCAL,
                COL_CP, COL_SURFACE, COL_PIECES, COL_VALEUR]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes dans le fichier: {missing}")
    pbar.update(1)

    # 2 — Cast types
    pbar.set_postfix_str("Cast types")
    df[COL_VALEUR] = to_float_fr(df[COL_VALEUR])
    df[COL_SURFACE] = to_float_fr(df[COL_SURFACE])
    df[COL_PIECES] = to_int(df[COL_PIECES])
    df[COL_CP] = df[COL_CP].astype(str).str.strip()
    pbar.update(1)

    # 3 — Filtre MVP (seulement Maison/Appartement)
    pbar.set_postfix_str("Filtrage type local")
    df = df[df[COL_TYPE_LOCAL].isin(["Maison", "Appartement"])].copy()
    pbar.update(1)

    # 4 — Filtre valeurs valides
    pbar.set_postfix_str("Filtrage valeurs")
    df = df[(df[COL_VALEUR] > 0) & (df[COL_SURFACE] > 0)].copy()
    pbar.update(1)

    # 5 — Target
    pbar.set_postfix_str("Calcul prix/m²")
    df["prix_m2"] = df[COL_VALEUR] / df[COL_SURFACE]
    pbar.update(1)

    # 6 — Retirer les cas sans pièces (parfois 0)
    pbar.set_postfix_str("Filtrage pièces")
    df = df[df[COL_PIECES].notna()].copy()
    df = df[df[COL_PIECES] > 0].copy()
    pbar.update(1)

    # 7 — Outliers
    pbar.set_postfix_str("Suppression outliers")

    # couper les micro-surfaces
    df = df[df[COL_SURFACE] >= 10].copy()

    df["prix_m2"] = pd.to_numeric(df["prix_m2"], errors="coerce")
    df = df[df["prix_m2"].notna()].copy()

    # keep only realistic range
    df = df[(df["prix_m2"] >= 200) & (df["prix_m2"] <= 60000)].copy()

    pbar.update(1)
    # 8 — Colonnes finales (MVP strict)
    pbar.set_postfix_str("Colonnes finales")
    clean = df.rename(
        columns={
            COL_CP: "code_postal",
            COL_SURFACE: "surface_reelle_bati",
            COL_PIECES: "nombre_pieces_principales",
            COL_TYPE_LOCAL: "type_local",
            COL_VALEUR: "valeur_fonciere",
            COL_DATE: "date_mutation",
            COL_DOC_ID: "id_document",
        }
    )[
        [
            "id_document",
            "date_mutation",
            "code_postal",
            "surface_reelle_bati",
            "nombre_pieces_principales",
            "type_local",
            "valeur_fonciere",
            "prix_m2",
        ]
    ].copy()
    pbar.update(1)

    # 9 — Sauvegarde
    pbar.set_postfix_str("Sauvegarde parquet")
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    clean.to_parquet(OUT_PATH, index=False)
    pbar.update(1)

    pbar.close()

    report = {
        "raw_rows": int(raw_rows),
        "clean_rows": int(len(clean)),
        "prix_m2_min": float(clean["prix_m2"].min()),
        "prix_m2_median": float(clean["prix_m2"].median()),
        "prix_m2_max": float(clean["prix_m2"].max()),
        "code_postal_unique": int(clean["code_postal"].nunique()),
        "type_local_counts": clean["type_local"].value_counts(dropna=False).to_dict(),
        "output": str(OUT_PATH),
    }
    REPORT_PATH.write_text(json.dumps(
        report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("✅ Dataset clean écrit:", OUT_PATH)
    print("📄 Report:", REPORT_PATH)
    print(report)


if __name__ == "__main__":
    main()
