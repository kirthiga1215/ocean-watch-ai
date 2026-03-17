from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    latitude: float = Field(default=15.0, ge=-75.0, le=75.0)
    longitude: float = Field(default=90.0, ge=-180.0, le=180.0)
    image_base64: str | None = None


class Location(BaseModel):
    latitude: float
    longitude: float


class PredictedLocation(Location):
    eta_minutes: int


class Detection(BaseModel):
    label: str
    confidence: float
    bbox: list[float]


class AnalyzeResponse(BaseModel):
    current_location: Location
    predicted_location: PredictedLocation
    wind: dict
    current: dict
    detections: list[Detection]
