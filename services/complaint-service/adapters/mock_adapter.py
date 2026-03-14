"""
Mock grievance adapter for development and testing.
Simulates filing and status queries without hitting any external service.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from .base import BaseAdapter, ComplaintData, ComplaintResult, ComplaintStatus

logger = logging.getLogger(__name__)

# In-memory store for mock complaints
_mock_db: dict[str, dict] = {}


class MockAdapter(BaseAdapter):
    """Simulates a government grievance portal."""

    async def authenticate(self) -> bool:
        logger.info("[MockAdapter] Authenticated successfully (simulated)")
        return True

    async def create_complaint(self, data: ComplaintData) -> ComplaintResult:
        external_id = f"MOCK-{uuid.uuid4().hex[:8].upper()}"

        _mock_db[external_id] = {
            "pothole_id": data.pothole_id,
            "status": "pending",
            "filed_at": datetime.now(timezone.utc).isoformat(),
            "data": {
                "lat": data.latitude,
                "lon": data.longitude,
                "severity": data.severity_level,
                "description": data.description,
            },
        }

        logger.info(
            f"[MockAdapter] Filed complaint {external_id} for pothole "
            f"{data.pothole_id} at ({data.latitude}, {data.longitude}) "
            f"severity={data.severity_level}"
        )

        return ComplaintResult(
            success=True,
            external_id=external_id,
            portal_name="mock-pgportal",
            message="Complaint filed successfully (mock)",
        )

    async def query_status(self, external_id: str) -> ComplaintStatus:
        record = _mock_db.get(external_id)
        if not record:
            return ComplaintStatus(
                external_id=external_id,
                status="not_found",
                details="No mock complaint found with this ID",
            )

        return ComplaintStatus(
            external_id=external_id,
            status=record["status"],
            last_update=record["filed_at"],
            details=f"Pothole {record['pothole_id']} — mock status",
        )
