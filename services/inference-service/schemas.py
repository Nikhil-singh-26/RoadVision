"""
Pydantic request/response models for the Inference API.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ── Shared ─────────────────────────────────────────────

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    class_name: str = "pothole"


class GeoLocation(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    road_name: Optional[str] = None


class PotholeDetection(BaseModel):
    bbox: BoundingBox
    severity_score: int = Field(ge=0, le=100, description="0-100 numeric severity")
    severity_level: str = Field(description="low / medium / high")


# ── Image Detection Response ──────────────────────────

class ImageDetectionResponse(BaseModel):
    detection_id: str
    created_at: datetime
    source_filename: str
    geo: Optional[GeoLocation] = None
    potholes: List[PotholeDetection]
    pothole_count: int
    confidence_avg: float
    overall_severity_score: int
    overall_severity_level: str
    annotated_image_url: str
    model_version: str


# ── Video Detection Response ──────────────────────────

class FrameDetection(BaseModel):
    frame_number: int
    timestamp_sec: float
    potholes: List[PotholeDetection]


class VideoDetectionResponse(BaseModel):
    detection_id: str
    created_at: datetime
    source_filename: str
    geo: Optional[GeoLocation] = None
    total_frames_processed: int
    frames_with_potholes: int
    total_potholes_detected: int
    confidence_avg: float
    overall_severity_score: int
    overall_severity_level: str
    annotated_video_url: str
    frame_detections: List[FrameDetection]
    model_version: str


# ── Health ─────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    model_loaded: bool
    model_path: str
    model_classes: List[str]
    uptime_seconds: float
