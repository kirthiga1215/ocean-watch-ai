import os
from pathlib import Path

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
NOAA_ERDDAP_BASE = "https://coastwatch.pfeg.noaa.gov/erddap"
NOAA_DATASET_ID = "erdQMekm1day"
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "15"))
WIND_DRAG_FACTOR = float(os.getenv("WIND_DRAG_FACTOR", "0.03"))

BASE_DIR = Path(__file__).resolve().parents[2]
MARIDA_DATASET_DIR = Path(os.getenv("MARIDA_DATASET_DIR", str(BASE_DIR / "MARIDA")))
