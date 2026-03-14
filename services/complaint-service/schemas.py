"""
Pydantic schemas for the Complaint Filing API.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FileComplaintRequest(BaseModel):
    pothole_id: str
    detection_id: Optional[str] = None
    latitude: float
    longitude: float
    severity_level: str = Field(description="low / medium / high")
    severity_score: int = Field(ge=0, le=100)
    annotated_image_url: str
    description: str = "Pothole detected via automated road monitoring system"
    road_name: Optional[str] = None


class FileComplaintResponse(BaseModel):
    success: bool
    complaint_id: Optional[str] = None
    external_id: Optional[str] = None
    portal_name: str
    message: str
    filed_at: datetime


class ComplaintStatusResponse(BaseModel):
    external_id: str
    status: str
    last_update: Optional[str] = None
    details: Optional[str] = None
