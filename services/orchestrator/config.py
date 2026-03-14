"""
Configuration for the Orchestrator service.
"""

import os

# Downstream service URLs
INFERENCE_SERVICE_URL = os.getenv("INFERENCE_SERVICE_URL", "http://localhost:8001")
COMPLAINT_SERVICE_URL = os.getenv("COMPLAINT_SERVICE_URL", "http://localhost:8002")

# Server
HOST = os.getenv("ORCHESTRATOR_HOST", "0.0.0.0")
PORT = int(os.getenv("ORCHESTRATOR_PORT", "8000"))

# Scheduler settings
REVERIFY_CRON = os.getenv("REVERIFY_CRON", "0 */6 * * *")  # every 6 hours
REVERIFY_ENABLED = os.getenv("REVERIFY_ENABLED", "false").lower() == "true"
