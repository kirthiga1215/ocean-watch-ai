from __future__ import annotations

import base64
from typing import Any

import cv2
import numpy as np
from ultralytics import YOLO


PLASTIC_PROXY_LABELS = {
    "bottle",
    "cup",
    "wine glass",
    "bowl",
    "fork",
    "knife",
    "spoon",
    "toothbrush",
    "cell phone",
}

_model: YOLO | None = None


def _get_model() -> YOLO:
    global _model
    if _model is None:
        _model = YOLO("yolov8n.pt")
    return _model


def _decode_image(image_base64: str) -> np.ndarray:
    payload = image_base64.split(",", 1)[-1]
    image_bytes = base64.b64decode(payload)
    image_np = np.frombuffer(image_bytes, dtype=np.uint8)
    decoded = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    if decoded is None:
        raise ValueError("Unable to decode base64 image")
    return decoded


def detect_plastic_clusters(image_base64: str | None) -> list[dict[str, Any]]:
    if not image_base64:
        return []

    image = _decode_image(image_base64)
    model = _get_model()
    results = model.predict(source=image, conf=0.2, verbose=False)

    detections: list[dict[str, Any]] = []
    for result in results:
        names = result.names
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            label = names[class_id]
            confidence = float(box.conf[0].item())
            x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]

            if label not in PLASTIC_PROXY_LABELS:
                continue

            detections.append(
                {
                    "label": label,
                    "confidence": round(confidence, 4),
                    "bbox": [round(x1, 2), round(y1, 2), round(x2, 2), round(y2, 2)],
                }
            )

    return detections
