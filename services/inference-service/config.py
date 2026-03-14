"""
Environment-driven configuration for the Inference Service.
All secrets and paths come from environment variables.
"""

import os
from pathlib import Path


# ── Model ──────────────────────────────────────────────
MODEL_PATH = os.getenv(
    "MODEL_PATH",
    str(Path(__file__).resolve().parents[2] / "runs" / "detect" / "train2" / "weights" / "best.pt"),
)
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
IOU_THRESHOLD = float(os.getenv("IOU_THRESHOLD", "0.45"))
IMAGE_SIZE = int(os.getenv("IMAGE_SIZE", "640"))

# ── Storage ────────────────────────────────────────────
STORAGE_DIR = os.getenv(
    "STORAGE_DIR",
    str(Path(__file__).resolve().parents[2] / "storage" / "detections"),
)
STORAGE_URL_PREFIX = os.getenv("STORAGE_URL_PREFIX", "/static/detections")

# ── Server ─────────────────────────────────────────────
HOST = os.getenv("INFERENCE_HOST", "0.0.0.0")
PORT = int(os.getenv("INFERENCE_PORT", "8001"))

# ── Severity tuning ───────────────────────────────────
SEVERITY_BBOX_WEIGHT = float(os.getenv("SEVERITY_BBOX_WEIGHT", "0.6"))
SEVERITY_CONF_WEIGHT = float(os.getenv("SEVERITY_CONF_WEIGHT", "0.4"))
SEVERITY_HIGH_THRESHOLD = int(os.getenv("SEVERITY_HIGH_THRESHOLD", "70"))
SEVERITY_MEDIUM_THRESHOLD = int(os.getenv("SEVERITY_MEDIUM_THRESHOLD", "40"))

# ── Geolocation ────────────────────────────────────────
NOMINATIM_ENABLED = os.getenv("NOMINATIM_ENABLED", "false").lower() == "true"
NOMINATIM_URL = os.getenv("NOMINATIM_URL", "https://nominatim.openstreetmap.org")
