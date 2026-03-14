"""
YOLOv8 model wrapper — loads model once, provides thread-safe inference.
"""

from __future__ import annotations

import logging
import threading
from pathlib import Path
from typing import List, Tuple

import cv2
import numpy as np
from ultralytics import YOLO

import config

logger = logging.getLogger(__name__)

_model: YOLO | None = None
_lock = threading.Lock()


def load_model() -> YOLO:
    """Load the YOLOv8 model (singleton, thread-safe)."""
    global _model
    if _model is not None:
        return _model
    with _lock:
        if _model is not None:
            return _model
        model_path = config.MODEL_PATH
        if not Path(model_path).exists():
            raise FileNotFoundError(f"Model weights not found at {model_path}")
        logger.info(f"Loading YOLOv8 model from {model_path}")
        _model = YOLO(model_path)
        logger.info(f"Model loaded — classes: {_model.names}")
        return _model


def get_model_info() -> dict:
    """Return model metadata."""
    model = load_model()
    return {
        "model_path": config.MODEL_PATH,
        "classes": list(model.names.values()),
        "model_version": Path(config.MODEL_PATH).stem,
    }


def run_inference_on_frame(
    frame: np.ndarray,
) -> List[Tuple[float, float, float, float, float, str]]:
    """
    Run inference on a single BGR frame.
    Returns list of (x1, y1, x2, y2, confidence, class_name).
    """
    model = load_model()
    results = model(
        frame,
        conf=config.CONFIDENCE_THRESHOLD,
        iou=config.IOU_THRESHOLD,
        imgsz=config.IMAGE_SIZE,
        verbose=False,
    )

    detections = []
    for r in results:
        boxes = r.boxes
        for i in range(len(boxes)):
            x1, y1, x2, y2 = boxes.xyxy[i].tolist()
            conf = float(boxes.conf[i])
            cls_id = int(boxes.cls[i])
            cls_name = model.names.get(cls_id, f"class_{cls_id}")
            detections.append((x1, y1, x2, y2, conf, cls_name))

    return detections


def annotate_frame(frame: np.ndarray) -> Tuple[np.ndarray, list]:
    """
    Run inference and return (annotated_frame, raw_detections).
    """
    model = load_model()
    results = model(
        frame,
        conf=config.CONFIDENCE_THRESHOLD,
        iou=config.IOU_THRESHOLD,
        imgsz=config.IMAGE_SIZE,
        verbose=False,
    )

    detections = []
    for r in results:
        boxes = r.boxes
        for i in range(len(boxes)):
            x1, y1, x2, y2 = boxes.xyxy[i].tolist()
            conf = float(boxes.conf[i])
            cls_id = int(boxes.cls[i])
            cls_name = model.names.get(cls_id, f"class_{cls_id}")
            detections.append((x1, y1, x2, y2, conf, cls_name))

    annotated = results[0].plot() if results else frame
    return annotated, detections
