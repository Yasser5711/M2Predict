import pandas as pd

from .model_registry import load_model

DEFAULT_MODEL = "v1_rf_te"


def make_features(payload: dict, te_data: dict):
    cp = str(payload["code_postal"]).zfill(5)

    departement = cp[:2]
    global_mean = te_data["global_mean"]
    mapping = te_data["mapping"]

    cp_te = mapping.get(cp, global_mean)

    return pd.DataFrame([{
        "departement": departement,
        "surface_reelle_bati": payload["surface_reelle_bati"],
        "nombre_pieces_principales": payload["nombre_pieces_principales"],
        "type_local": payload["type_local"],
        "cp_te": cp_te,
    }])


def predict(payload: dict, model_version: str = DEFAULT_MODEL):
    bundle = load_model(model_version)

    X = make_features(payload, bundle.te_mapping)
    prix_m2 = float(bundle.model.predict(X)[0])
    prix_total = prix_m2 * payload["surface_reelle_bati"]

    return {
        "model_version": model_version,
        "prix_m2": round(prix_m2, 2),
        "prix_total_estime": round(prix_total, 2),
    }
