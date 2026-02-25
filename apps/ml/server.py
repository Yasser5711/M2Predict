from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from inference.predict import predict

app = FastAPI(title="M2Predict API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    code_postal: str
    surface_reelle_bati: float
    nombre_pieces_principales: int
    type_local: str


@app.post("/predict")
def predict_endpoint(req: PredictRequest, model_version: str = "v1_rf_te"):
    result = predict(req.model_dump(), model_version=model_version)
    return result
