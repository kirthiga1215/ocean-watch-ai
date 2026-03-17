from __future__ import annotations

import math

from utils.config import WIND_DRAG_FACTOR

EARTH_RADIUS_METERS = 6_371_000.0


def _wind_to_uv(speed_mps: float, direction_deg: float) -> tuple[float, float]:
    toward_deg = (direction_deg + 180.0) % 360.0
    theta = math.radians(toward_deg)
    u_east = speed_mps * math.sin(theta)
    v_north = speed_mps * math.cos(theta)
    return u_east, v_north


def predict_location_after_minutes(
    latitude: float,
    longitude: float,
    wind_speed_mps: float,
    wind_direction_deg: float,
    current_u_mps: float,
    current_v_mps: float,
    minutes: int = 120,
) -> dict:
    wind_u, wind_v = _wind_to_uv(wind_speed_mps, wind_direction_deg)

    drift_u = current_u_mps + WIND_DRAG_FACTOR * wind_u
    drift_v = current_v_mps + WIND_DRAG_FACTOR * wind_v

    duration_seconds = minutes * 60
    displacement_east = drift_u * duration_seconds
    displacement_north = drift_v * duration_seconds

    dlat = math.degrees(displacement_north / EARTH_RADIUS_METERS)
    cos_lat = max(math.cos(math.radians(latitude)), 1e-6)
    dlon = math.degrees(displacement_east / (EARTH_RADIUS_METERS * cos_lat))

    return {
        "latitude": latitude + dlat,
        "longitude": longitude + dlon,
        "eta_minutes": minutes,
        "drift_u_mps": drift_u,
        "drift_v_mps": drift_v,
    }
