from __future__ import annotations

import requests

from utils.config import OPEN_METEO_URL, OPENWEATHER_API_KEY, OPENWEATHER_URL, REQUEST_TIMEOUT_SECONDS


class WindServiceError(RuntimeError):
    pass


def _fetch_openweather(lat: float, lon: float) -> dict:
    if not OPENWEATHER_API_KEY:
        raise WindServiceError("OPENWEATHER_API_KEY is not set")

    response = requests.get(
        OPENWEATHER_URL,
        params={"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": "metric"},
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    payload = response.json()

    wind = payload.get("wind", {})
    speed_mps = float(wind.get("speed", 0.0))
    direction_deg = float(wind.get("deg", 0.0))

    return {
        "speed_mps": speed_mps,
        "direction_deg": direction_deg,
        "source": "openweather",
    }


def _fetch_open_meteo(lat: float, lon: float) -> dict:
    response = requests.get(
        OPEN_METEO_URL,
        params={
            "latitude": lat,
            "longitude": lon,
            "current": "wind_speed_10m,wind_direction_10m",
            "wind_speed_unit": "ms",
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    payload = response.json().get("current", {})

    return {
        "speed_mps": float(payload.get("wind_speed_10m", 0.0)),
        "direction_deg": float(payload.get("wind_direction_10m", 0.0)),
        "source": "open-meteo-fallback",
    }


def fetch_wind(lat: float, lon: float) -> dict:
    try:
        return _fetch_openweather(lat, lon)
    except Exception:
        return _fetch_open_meteo(lat, lon)
