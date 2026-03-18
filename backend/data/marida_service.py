from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import shapefile
from pyproj import Transformer

from utils.config import MARIDA_DATASET_DIR


class MaridaDatasetError(Exception):
    pass


@dataclass(frozen=True)
class Cluster:
    id: int
    confidence: float
    report: int
    latitude: float
    longitude: float
    area_m2: float
    label: str


def _polygon_area_m2(points: list[tuple[float, float]]) -> float:
    if len(points) < 3:
        return 0.0

    area = 0.0
    for i in range(len(points)):
        x1, y1 = points[i]
        x2, y2 = points[(i + 1) % len(points)]
        area += (x1 * y2) - (x2 * y1)
    return abs(area) * 0.5


def _confidence_to_density(confidence: float) -> str:
    if confidence >= 3:
        return "High"
    if confidence >= 2:
        return "Moderate"
    return "Low"


def _density_score(confidence: float) -> float:
    return min(max(confidence / 3.0, 0.0), 1.0)


@lru_cache(maxsize=1)
def load_marida_summary() -> dict:
    shapefile_dir = MARIDA_DATASET_DIR / "shapefiles"
    if not shapefile_dir.exists():
        raise MaridaDatasetError(f"MARIDA shapefiles directory not found: {shapefile_dir}")

    shp_files = sorted(shapefile_dir.glob("*.shp"))
    if not shp_files:
        raise MaridaDatasetError(f"No shapefiles found in: {shapefile_dir}")

    transformer = Transformer.from_crs("EPSG:32748", "EPSG:4326", always_xy=True)

    clusters: list[Cluster] = []
    for shp_path in shp_files:
        reader = shapefile.Reader(str(shp_path))
        field_names = [f[0] for f in reader.fields[1:]]

        id_index = field_names.index("id") if "id" in field_names else -1
        conf_index = field_names.index("conf") if "conf" in field_names else -1
        report_index = field_names.index("report") if "report" in field_names else -1

        for record, shape in zip(reader.records(), reader.shapes()):
            if not shape.points:
                continue

            polygon_points = [(float(x), float(y)) for x, y in shape.points]
            centroid_x = sum(p[0] for p in polygon_points) / len(polygon_points)
            centroid_y = sum(p[1] for p in polygon_points) / len(polygon_points)
            lon, lat = transformer.transform(centroid_x, centroid_y)

            confidence = float(record[conf_index]) if conf_index >= 0 else 1.0
            report = int(record[report_index]) if report_index >= 0 else 0
            cluster_id = int(record[id_index]) if id_index >= 0 else len(clusters) + 1

            clusters.append(
                Cluster(
                    id=cluster_id,
                    confidence=confidence,
                    report=report,
                    latitude=lat,
                    longitude=lon,
                    area_m2=_polygon_area_m2(polygon_points),
                    label=f"{shp_path.stem}-#{cluster_id}",
                )
            )

    if not clusters:
        raise MaridaDatasetError("No cluster polygons found in MARIDA shapefiles")

    total_area_m2 = sum(c.area_m2 for c in clusters)
    avg_conf = sum(c.confidence for c in clusters) / len(clusters)
    avg_lat = sum(c.latitude for c in clusters) / len(clusters)
    avg_lon = sum(c.longitude for c in clusters) / len(clusters)

    top_clusters = sorted(clusters, key=lambda c: c.area_m2, reverse=True)[:120]

    response_clusters = [
        {
            "id": c.id,
            "lat": round(c.latitude, 6),
            "lng": round(c.longitude, 6),
            "density": round(_density_score(c.confidence), 4),
            "size_tons": round(max(c.area_m2 / 1000.0, 1.0), 2),
            "label": c.label,
            "confidence": c.confidence,
            "report": c.report,
        }
        for c in top_clusters
    ]

    center_cluster = top_clusters[0]
    trajectory = [
        [round(center_cluster.latitude, 6), round(center_cluster.longitude, 6)],
        [round(center_cluster.latitude + 0.01, 6), round(center_cluster.longitude + 0.01, 6)],
        [round(center_cluster.latitude + 0.02, 6), round(center_cluster.longitude + 0.015, 6)],
    ]

    return {
        "dataset": "MARIDA",
        "summary": {
            "cluster_count": len(clusters),
            "density_level": _confidence_to_density(avg_conf),
            "last_scan": "Dataset snapshot",
            "center_lat": round(avg_lat, 6),
            "center_lng": round(avg_lon, 6),
            "total_area_km2": round(total_area_m2 / 1_000_000.0, 3),
        },
        "clusters": response_clusters,
        "trajectory": trajectory,
    }
