"""
Human-in-the-loop adapter.

When automated filing isn't possible (CAPTCHA, credential issues, etc.),
this adapter creates a "pending" task with all complaint details, so a
human operator can manually submit it.
"""

from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from .base import BaseAdapter, ComplaintData, ComplaintResult, ComplaintStatus

logger = logging.getLogger(__name__)

PENDING_DIR = os.getenv(
    "HUMAN_PENDING_DIR",
    str(Path(__file__).resolve().parents[2] / "pending-complaints"),
)


class HumanAdapter(BaseAdapter):
    """
    Creates a JSON file with complaint details for manual submission.
    The operator picks up the file, submits the complaint on the portal,
    and updates the file with the external complaint ID.
    """

    async def authenticate(self) -> bool:
        os.makedirs(PENDING_DIR, exist_ok=True)
        logger.info(f"[HumanAdapter] Pending complaints dir: {PENDING_DIR}")
        return True

    async def create_complaint(self, data: ComplaintData) -> ComplaintResult:
        task_id = f"HUMAN-{uuid.uuid4().hex[:8].upper()}"
        os.makedirs(PENDING_DIR, exist_ok=True)

        task_file = os.path.join(PENDING_DIR, f"{task_id}.json")
        task_data = {
            "task_id": task_id,
            "status": "pending_human_action",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "pothole_id": data.pothole_id,
            "location": {
                "latitude": data.latitude,
                "longitude": data.longitude,
                "road_name": data.road_name,
            },
            "severity": {
                "level": data.severity_level,
                "score": data.severity_score,
            },
            "annotated_image_url": data.annotated_image_url,
            "description": data.description,
            "detection_id": data.detection_id,
            "instructions": (
                "Please file this complaint manually on pgportal.gov.in. "
                "After filing, update this file with the external_complaint_id "
                "field and change status to 'filed'."
            ),
            "external_complaint_id": None,
        }

        with open(task_file, "w") as f:
            json.dump(task_data, f, indent=2)

        logger.info(
            f"[HumanAdapter] Created pending task {task_id} at {task_file}"
        )

        return ComplaintResult(
            success=True,
            external_id=task_id,
            portal_name="human-in-the-loop",
            message=f"Task created at {task_file} — awaiting human submission",
        )

    async def query_status(self, external_id: str) -> ComplaintStatus:
        task_file = os.path.join(PENDING_DIR, f"{external_id}.json")
        if not os.path.exists(task_file):
            return ComplaintStatus(
                external_id=external_id,
                status="not_found",
                details="No pending task found with this ID",
            )

        with open(task_file) as f:
            task_data = json.load(f)

        return ComplaintStatus(
            external_id=external_id,
            status=task_data.get("status", "unknown"),
            last_update=task_data.get("created_at"),
            details=task_data.get("instructions"),
        )
