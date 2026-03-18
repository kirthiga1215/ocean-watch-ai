from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from data.marida_service import MaridaDatasetError, load_marida_summary
from data.ocean_current_service import OceanCurrentServiceError, fetch_ocean_current
from data.wind_service import WindServiceError, fetch_wind
from prediction.movement_model import predict_location_after_minutes
from utils.schemas import AnalyzeRequest, AnalyzeResponse, DatasetDashboardResponse

app = FastAPI(title="Ocean Plastic Monitoring API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/dataset/dashboard", response_model=DatasetDashboardResponse)
def dataset_dashboard():
    try:
        return load_marida_summary()
    except MaridaDatasetError as exc:
        raise HTTPException(status_code=500, detail=f"Dataset loading error: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected dataset error: {exc}") from exc


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    from detection.yolo_detector import detect_plastic_clusters

    try:
        detections = detect_plastic_clusters(payload.image_base64)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Detection error: {exc}") from exc

    try:
        wind = fetch_wind(payload.latitude, payload.longitude)
    except WindServiceError as exc:
        raise HTTPException(status_code=502, detail=f"Wind API error: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Unexpected wind API error: {exc}") from exc

    try:
        current = fetch_ocean_current(payload.latitude, payload.longitude)
    except OceanCurrentServiceError as exc:
        raise HTTPException(status_code=502, detail=f"Ocean API error: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Unexpected ocean API error: {exc}") from exc

    predicted = predict_location_after_minutes(
        latitude=payload.latitude,
        longitude=payload.longitude,
        wind_speed_mps=wind["speed_mps"],
        wind_direction_deg=wind["direction_deg"],
        current_u_mps=current["u_component_mps"],
        current_v_mps=current["v_component_mps"],
        minutes=120,
    )

    return {
        "current_location": {
            "latitude": payload.latitude,
            "longitude": payload.longitude,
        },
        "predicted_location": {
            "latitude": predicted["latitude"],
            "longitude": predicted["longitude"],
            "eta_minutes": predicted["eta_minutes"],
        },
        "wind": wind,
        "current": current,
        "detections": detections,
    }
