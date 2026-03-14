"""
PG Portal adapter using Playwright browser automation.

IMPORTANT: pgportal.gov.in has NO public API. This adapter automates the
web form using a headless browser. It requires:
  - Valid user credentials (from env vars)
  - Playwright browsers installed (npx playwright install chromium)

This is FRAGILE and will break if the portal changes its UI.
Use the MockAdapter for development and testing.
"""

from __future__ import annotations

import logging
import os
import asyncio
from typing import Optional

from .base import BaseAdapter, ComplaintData, ComplaintResult, ComplaintStatus

logger = logging.getLogger(__name__)

# Credentials from environment (NEVER hardcode)
PGPORTAL_USERNAME = os.getenv("PGPORTAL_USERNAME", "")
PGPORTAL_PASSWORD = os.getenv("PGPORTAL_PASSWORD", "")
PGPORTAL_URL = os.getenv("PGPORTAL_URL", "https://pgportal.gov.in")


class PGPortalAdapter(BaseAdapter):
    """
    Browser-automation adapter for pgportal.gov.in.

    This is a TEMPLATE implementation. The actual form selectors will need
    to be updated based on the portal's current UI structure. The general
    flow is:
        1. Navigate to login page
        2. Fill credentials and submit
        3. Navigate to complaint form
        4. Fill complaint details (location, description, image)
        5. Submit and capture the complaint ID
    """

    def __init__(self):
        self._browser = None
        self._page = None

    async def authenticate(self) -> bool:
        if not PGPORTAL_USERNAME or not PGPORTAL_PASSWORD:
            logger.error(
                "[PGPortalAdapter] Missing credentials. "
                "Set PGPORTAL_USERNAME and PGPORTAL_PASSWORD env vars."
            )
            return False

        try:
            from playwright.async_api import async_playwright

            pw = await async_playwright().start()
            self._browser = await pw.chromium.launch(headless=True)
            self._page = await self._browser.new_page()

            await self._page.goto(f"{PGPORTAL_URL}/Login")
            await self._page.fill("#txtUsername", PGPORTAL_USERNAME)
            await self._page.fill("#txtPassword", PGPORTAL_PASSWORD)
            await self._page.click("#btnLogin")
            await self._page.wait_for_load_state("networkidle")

            # Check if login was successful (look for dashboard element)
            if "Dashboard" in await self._page.content():
                logger.info("[PGPortalAdapter] Login successful")
                return True
            else:
                logger.error("[PGPortalAdapter] Login failed — check credentials")
                return False

        except ImportError:
            logger.error(
                "[PGPortalAdapter] Playwright not installed. "
                "Run: pip install playwright && playwright install chromium"
            )
            return False
        except Exception as e:
            logger.error(f"[PGPortalAdapter] Authentication error: {e}")
            return False

    async def create_complaint(self, data: ComplaintData) -> ComplaintResult:
        if not self._page:
            auth_ok = await self.authenticate()
            if not auth_ok:
                return ComplaintResult(
                    success=False,
                    portal_name="pgportal.gov.in",
                    message="Authentication failed — cannot file complaint",
                )

        try:
            # Navigate to grievance registration
            await self._page.goto(f"{PGPORTAL_URL}/Registration/Loging")
            await self._page.wait_for_load_state("networkidle")

            # Build description
            description = (
                f"Pothole detected via automated road monitoring system.\n"
                f"Location: {data.latitude}, {data.longitude}\n"
                f"Road: {data.road_name or 'Unknown'}\n"
                f"Severity: {data.severity_level} (score: {data.severity_score}/100)\n"
                f"Detection ID: {data.detection_id}\n\n"
                f"{data.description}"
            )

            # NOTE: These selectors are PLACEHOLDERS and must be updated
            # based on the actual portal form structure
            # await self._page.select_option("#ddlMinistry", label="...")
            # await self._page.fill("#txtGrievanceDescription", description)
            # await self._page.fill("#txtAddress", f"{data.latitude}, {data.longitude}")
            # await self._page.set_input_files("#fileUpload", data.annotated_image_url)
            # await self._page.click("#btnSubmit")

            logger.warning(
                "[PGPortalAdapter] create_complaint called but form selectors "
                "are placeholders. Update selectors for the actual portal UI."
            )

            return ComplaintResult(
                success=False,
                portal_name="pgportal.gov.in",
                message=(
                    "Browser automation template — selectors need to be configured "
                    "for the actual portal. Use MockAdapter for development."
                ),
            )

        except Exception as e:
            logger.error(f"[PGPortalAdapter] Complaint filing error: {e}")
            return ComplaintResult(
                success=False,
                portal_name="pgportal.gov.in",
                message=f"Error: {e}",
            )

    async def query_status(self, external_id: str) -> ComplaintStatus:
        """Query complaint status from PG Portal."""
        logger.warning(
            "[PGPortalAdapter] query_status is a stub — "
            "implement based on portal's status page."
        )
        return ComplaintStatus(
            external_id=external_id,
            status="unknown",
            details="PG Portal status query not yet implemented",
        )

    async def close(self):
        """Clean up browser resources."""
        if self._browser:
            await self._browser.close()
