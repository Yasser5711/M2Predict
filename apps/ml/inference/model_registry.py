import json
from pathlib import Path

import joblib

ROOT = Path(__file__).resolve().parents[1]  # apps/ml/
MODELS_DIR = ROOT / "artifacts" / "models"


class ModelBundle:
    def __init__(self, model, te_mapping, metadata, pi_p5=None, pi_p95=None, bootstrap_models=None):
        self.model = model
        self.te_mapping = te_mapping
        self.metadata = metadata
        self.pi_p5 = pi_p5
        self.pi_p95 = pi_p95
        self.bootstrap_models = bootstrap_models or []


def load_model(version: str) -> ModelBundle:
    model_dir = MODELS_DIR / version
    if not model_dir.exists():
        raise ValueError(f"Model version '{version}' not found")

    model = joblib.load(model_dir / "model.joblib")
    metadata = json.loads(
        (model_dir / "metadata.json").read_text(encoding="utf-8"))
    te_mapping = json.loads(
        (model_dir / "target_encoding.json").read_text(encoding="utf-8"))

    conf = metadata.get("confidence", {})
    pi_p5 = conf.get("pi_p5", None)
    pi_p95 = conf.get("pi_p95", None)

    # (optionnel) charger bootstraps HGB si présents
    bootstrap_models = []
    bs_dir = conf.get("bootstrap_dir")
    if bs_dir:
        bs_path = Path(bs_dir)
        if not bs_path.is_absolute():
            bs_path = model_dir / "bootstrap"
        if bs_path.exists():
            for p in sorted(bs_path.glob("model_boot_*.joblib")):
                bootstrap_models.append(joblib.load(p))

    return ModelBundle(
        model=model,
        te_mapping=te_mapping,
        metadata=metadata,
        pi_p5=pi_p5,
        pi_p95=pi_p95,
        bootstrap_models=bootstrap_models,
    )
