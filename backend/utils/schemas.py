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


class DatasetCluster(BaseModel):
    id: int
    lat: float
    lng: float
    density: float
    size_tons: float
    label: str
    confidence: float
    report: int


class DatasetSummary(BaseModel):
    cluster_count: int
    density_level: str
    last_scan: str
    center_lat: float
    center_lng: float
    total_area_km2: float


class DatasetDashboardResponse(BaseModel):
    dataset: str
    summary: DatasetSummary
    clusters: list[DatasetCluster]
    trajectory: list[list[float]]
