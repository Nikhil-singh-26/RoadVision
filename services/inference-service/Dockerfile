# ── Build stage ────────────────────────────────
FROM python:3.11-slim AS base

WORKDIR /app

# System deps for OpenCV headless
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ── Runtime ────────────────────────────────────
ENV MODEL_PATH=/models/best.pt
ENV STORAGE_DIR=/app/storage/detections
ENV INFERENCE_HOST=0.0.0.0
ENV INFERENCE_PORT=8001

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import requests; r=requests.get('http://localhost:8001/v1/health'); exit(0 if r.ok else 1)"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
