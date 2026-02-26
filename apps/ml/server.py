from __future__ import annotations

import os

from fastapi import Depends, FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from inference.predict import predict

API_KEY = os.environ.get("API_KEY", "")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3001").split(",")

app = FastAPI(title="M2Predict API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["POST"],
    allow_headers=["Content-Type", "Authorization"],
)

security = HTTPBearer()


def verify_api_key(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> str:
    if not API_KEY:
        raise HTTPException(status_code=500, detail="API_KEY not configured")
    if credentials.credentials != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return credentials.credentials


class PredictRequest(BaseModel):
    code_postal: str
    surface_reelle_bati: float
    nombre_pieces_principales: int
    type_local: str


@app.post("/predict")
def predict_endpoint(
    req: PredictRequest,
    model_version: str = "v1_rf_te",
    _key: str = Depends(verify_api_key),
):
    result = predict(req.model_dump(), model_version=model_version)
    return result
