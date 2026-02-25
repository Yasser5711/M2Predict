import json
from pathlib import Path

import joblib

ROOT = Path(__file__).resolve().parents[1]  # apps/ml/
MODELS_DIR = ROOT / "artifacts" / "models"


class ModelBundle:
    def __init__(self, model, te_mapping, metadata):
        self.model = model
        self.te_mapping = te_mapping
        self.metadata = metadata


def load_model(version: str) -> ModelBundle:
    model_dir = MODELS_DIR / version

    if not model_dir.exists():
        raise ValueError(f"Model version '{version}' not found")

    model = joblib.load(model_dir / "model.joblib")
    metadata = json.loads(
        (model_dir / "metadata.json").read_text(encoding="utf-8"))
    te_mapping = json.loads(
        (model_dir / "target_encoding.json").read_text(encoding="utf-8"))

    return ModelBundle(model, te_mapping, metadata)
