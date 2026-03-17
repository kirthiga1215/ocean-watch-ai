from __future__ import annotations

import math
import time

import requests

from utils.config import NOAA_DATASET_ID, NOAA_ERDDAP_BASE, REQUEST_TIMEOUT_SECONDS


class OceanCurrentServiceError(RuntimeError):
    pass


_time_cache: dict[str, float | str | None] = {"value": None, "fetched_at": 0.0}
CACHE_TTL_SECONDS = 3600


def _to_360_longitude(lon: float) -> float:
    return lon % 360


def _get_latest_dataset_time() -> str:
    now = time.time()
    if _time_cache["value"] and now - float(_time_cache["fetched_at"] or 0) < CACHE_TTL_SECONDS:
        return str(_time_cache["value"])

    info_url = f"{NOAA_ERDDAP_BASE}/info/{NOAA_DATASET_ID}/index.json"
    response = requests.get(info_url, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    payload = response.json()

    rows = payload.get("table", {}).get("rows", [])
    latest_time = None
    for row in rows:
        if row[0] == "attribute" and row[1] == "NC_GLOBAL" and row[2] == "time_coverage_end":
            latest_time = row[4]
            break

    if not latest_time:
        raise OceanCurrentServiceError("Unable to read NOAA dataset latest timestamp")

    _time_cache["value"] = latest_time
    _time_cache["fetched_at"] = now
    return str(latest_time)


def _vector_to_direction_deg(u: float, v: float) -> float:
    return (math.degrees(math.atan2(u, v)) + 360) % 360


def fetch_ocean_current(lat: float, lon: float) -> dict:
    clamped_lat = max(-75.0, min(75.0, lat))
    lon_360 = _to_360_longitude(lon)
    dataset_time = _get_latest_dataset_time()

    query = (
        f"u_current[({dataset_time})][(0.0)][({clamped_lat:.2f})][({lon_360:.2f})],"
        f"v_current[({dataset_time})][(0.0)][({clamped_lat:.2f})][({lon_360:.2f})]"
    )
    url = f"{NOAA_ERDDAP_BASE}/griddap/{NOAA_DATASET_ID}.json?{''.join(query)}"

    response = requests.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    payload = response.json()

    rows = payload.get("table", {}).get("rows", [])
    if not rows:
        raise OceanCurrentServiceError("No ocean current rows returned from NOAA")

    row = rows[0]
    u_component = float(row[4])
    v_component = float(row[5])
    speed = math.sqrt(u_component * u_component + v_component * v_component)

    return {
        "u_component_mps": u_component,
        "v_component_mps": v_component,
        "speed_mps": speed,
        "direction_deg": _vector_to_direction_deg(u_component, v_component),
        "source": f"noaa-erddap:{NOAA_DATASET_ID}",
        "dataset_time": dataset_time,
    }
