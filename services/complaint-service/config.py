"""
Configuration for the Complaint Filing Service.
"""

import os

# Which adapter to use: mock | pgportal | human
ADAPTER_TYPE = os.getenv("COMPLAINT_ADAPTER", "mock")

# Server
HOST = os.getenv("COMPLAINT_HOST", "0.0.0.0")
PORT = int(os.getenv("COMPLAINT_PORT", "8002"))

# PG Portal credentials (only used by pgportal adapter)
PGPORTAL_USERNAME = os.getenv("PGPORTAL_USERNAME", "")
PGPORTAL_PASSWORD = os.getenv("PGPORTAL_PASSWORD", "")
PGPORTAL_URL = os.getenv("PGPORTAL_URL", "https://pgportal.gov.in")

# Human adapter pending dir
HUMAN_PENDING_DIR = os.getenv("HUMAN_PENDING_DIR", "./pending-complaints")

# Retry settings
MAX_RETRIES = int(os.getenv("COMPLAINT_MAX_RETRIES", "3"))
RETRY_BACKOFF_BASE = float(os.getenv("COMPLAINT_RETRY_BACKOFF", "2.0"))
