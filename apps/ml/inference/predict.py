import numpy as np
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


def _score_from_width(pi_width: float, p5: float | None, p95: float | None) -> float:
    if p5 is None or p95 is None:
        return 0.5  # fallback if metadata missing
    denom = (p95 - p5) if (p95 - p5) != 0 else 1e-9
    score = 1 - (pi_width - p5) / denom
    return float(np.clip(score, 0, 1))


def predict(payload: dict, model_version: str = DEFAULT_MODEL):
    bundle = load_model(model_version)
    X = make_features(payload, bundle.te_mapping)

    pipe = bundle.model  # Pipeline(preprocess + model)
    prix_m2 = float(pipe.predict(X)[0])

    pre = pipe.named_steps["preprocess"]
    core_model = pipe.named_steps["model"]

    # ----------------------------
    # Confidence: RF vs HGB
    # ----------------------------
    pi_width = None
    q10 = None
    q90 = None

    # Case 1: RandomForestRegressor (has estimators_)
    if hasattr(core_model, "estimators_"):
        Xt = pre.transform(X)
        all_tree_preds = np.array([tree.predict(Xt)[0]
                                  for tree in core_model.estimators_])
        q10 = float(np.quantile(all_tree_preds, 0.10))
        q90 = float(np.quantile(all_tree_preds, 0.90))
        pi_width = q90 - q10

    # Case 2: HistGradientBoostingRegressor -> use bootstrap models
    else:
        # bundle.bootstrap_models is loaded in model_registry.py (from metadata.confidence.bootstrap_dir)
        if bundle.bootstrap_models:
            boot_preds = np.array([float(m.predict(X)[0])
                                  for m in bundle.bootstrap_models])
            q10 = float(np.quantile(boot_preds, 0.10))
            q90 = float(np.quantile(boot_preds, 0.90))
            pi_width = q90 - q10
        else:
            # no bootstrap models available => cannot compute uncertainty properly
            pi_width = None

    score = _score_from_width(
        pi_width=float(pi_width) if pi_width is not None else 0.0,
        p5=bundle.pi_p5,
        p95=bundle.pi_p95,
    ) if pi_width is not None else 0.5

    surface = float(payload["surface_reelle_bati"])
    prix_total = prix_m2 * surface

    return {
        "model_version": model_version,
        "prix_m2": round(prix_m2, 2),
        "prix_total_estime": round(prix_total, 2),
        "score_confiance": round(score, 3),

        # optional debug
        "intervalle_largeur": None if pi_width is None else round(float(pi_width), 2),
        "q10": None if q10 is None else round(q10, 2),
        "q90": None if q90 is None else round(q90, 2),
        "confidence_method": bundle.metadata.get("confidence", {}).get("method"),
    }
