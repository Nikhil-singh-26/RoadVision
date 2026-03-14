"""
Abstract base class for grievance portal adapters.
Each adapter implements authenticate, create_complaint, and query_status.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class ComplaintData:
    """Data needed to file a complaint."""
    pothole_id: str
    latitude: float
    longitude: float
    severity_level: str          # low / medium / high
    severity_score: int          # 0-100
    annotated_image_url: str
    description: str
    road_name: Optional[str] = None
    detection_id: Optional[str] = None


@dataclass
class ComplaintResult:
    """Result of filing a complaint."""
    success: bool
    external_id: Optional[str] = None   # ID from the govt portal
    portal_name: str = ""
    message: str = ""
    raw_response: Optional[dict] = None


@dataclass
class ComplaintStatus:
    """Status of a previously filed complaint."""
    external_id: str
    status: str                  # pending / in_progress / resolved / rejected
    last_update: Optional[str] = None
    details: Optional[str] = None


class BaseAdapter(ABC):
    """Interface that every grievance portal adapter must implement."""

    @abstractmethod
    async def authenticate(self) -> bool:
        """Authenticate with the portal. Returns True on success."""
        ...

    @abstractmethod
    async def create_complaint(self, data: ComplaintData) -> ComplaintResult:
        """File a new complaint. Returns result with external ID."""
        ...

    @abstractmethod
    async def query_status(self, external_id: str) -> ComplaintStatus:
        """Query the status of a previously filed complaint."""
        ...
