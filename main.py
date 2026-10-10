import os
import warnings
from pathlib import Path
from typing import List

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "ecg_random_forest.pkl"

# Dataset class mapping commonly used for this ECG heartbeat dataset.
# Verify against the dataset documentation before academic submission.
CLASS_LABELS = {
    0: "N",
    1: "S",
    2: "V",
    3: "F",
    4: "Q",
}

app = FastAPI(
    title="ECG Heartbeat Classification API",
    description="Educational heartbeat-classification backend; not a medical diagnostic service.",
    version="1.0.0",
)

# Configure FRONTEND_ORIGINS with comma-separated deployed frontend origins.
origins_env = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

try:
    # Only load pickle files you trust. This file was supplied by the project owner.
    with warnings.catch_warnings():
        warnings.simplefilter("default")
        model = joblib.load(MODEL_PATH)
except Exception as exc:
    raise RuntimeError(f"Could not load model at {MODEL_PATH}: {exc}") from exc

if getattr(model, "n_features_in_", None) != 187:
    raise RuntimeError(
        f"Expected a model trained on 187 features; got {getattr(model, 'n_features_in_', None)}."
    )


class PredictRequest(BaseModel):
    signals: List[List[float]] = Field(..., min_length=1, max_length=5000)


class PredictionItem(BaseModel):
    predictedClass: str
    confidence: float


class PredictResponse(BaseModel):
    results: List[PredictionItem]


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": True, "features_per_beat": 187}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    try:
        values = np.asarray(request.signals, dtype=np.float64)
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail="All ECG values must be numeric.")

    if values.ndim != 2 or values.shape[1] != 187:
        raise HTTPException(status_code=422, detail="Each ECG row must contain exactly 187 values.")

    if not np.isfinite(values).all():
        raise HTTPException(status_code=422, detail="ECG values must not contain NaN or infinity.")

    try:
        predictions = model.predict(values)
        probabilities = model.predict_proba(values) if hasattr(model, "predict_proba") else None
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {type(exc).__name__}") from exc

    results = []
    for i, prediction in enumerate(predictions):
        class_id = int(prediction)
        confidence = float(np.max(probabilities[i])) if probabilities is not None else None
        # This is the model's maximum class probability, not calibrated clinical certainty.
        results.append({
            "predictedClass": CLASS_LABELS.get(class_id, str(class_id)),
            "confidence": confidence,
        })

    return {"results": results}
