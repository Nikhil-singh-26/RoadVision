#!/bin/bash
# ─────────────────────────────────────────────────
# RoadVision — Start All Services (Local Dev)
# Run from project root: bash run_services.sh
# ─────────────────────────────────────────────────

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "=== RoadVision Service Launcher ==="
echo "Project root: $PROJECT_ROOT"

# ── Clean up any broken venv from previous attempts ──
if [ -d "$PROJECT_ROOT/services/.venv" ]; then
    echo ">>> Cleaning up broken .venv..."
    rm -rf "$PROJECT_ROOT/services/.venv"
fi

# ── Use the existing ml-pipeline venv ──
VENV_DIR="$PROJECT_ROOT/ml-pipeline/venv"
if [ -d "$VENV_DIR" ]; then
    echo ">>> Using existing venv at ml-pipeline/venv"
    source "$VENV_DIR/bin/activate"
else
    echo ">>> No existing venv found. Installing globally with pip..."
    echo ">>> (If you want a venv, run: sudo apt install python3.12-venv)"
fi

echo ">>> Python: $(python3 --version)"
echo ">>> pip: $(pip --version)"

# ── Install additional dependencies for services ──
echo ""
echo ">>> Installing inference-service dependencies..."
pip install -q fastapi uvicorn python-multipart httpx Pillow pydantic 2>&1 | tail -5

echo ">>> Installing complaint-service dependencies..."
# (fastapi/uvicorn/pydantic already installed above)

echo ">>> Installing orchestrator dependencies..."
# httpx already installed above

echo ""
echo "=== All dependencies installed ==="

# ── Create storage dir ──
mkdir -p "$PROJECT_ROOT/storage/detections"

# ── Start services in background ──
echo ""
echo ">>> Starting Inference Service on :8001..."
cd "$PROJECT_ROOT/services/inference-service"
MODEL_PATH="$PROJECT_ROOT/runs/detect/train2/weights/best.pt" \
STORAGE_DIR="$PROJECT_ROOT/storage/detections" \
python3 main.py &
INFERENCE_PID=$!

echo ">>> Starting Complaint Service on :8002..."
cd "$PROJECT_ROOT/services/complaint-service"
COMPLAINT_ADAPTER=mock \
python3 main.py &
COMPLAINT_PID=$!

sleep 3

echo ">>> Starting Orchestrator on :8000..."
cd "$PROJECT_ROOT/services/orchestrator"
INFERENCE_SERVICE_URL=http://localhost:8001 \
COMPLAINT_SERVICE_URL=http://localhost:8002 \
python3 main.py &
ORCHESTRATOR_PID=$!

echo ""
echo "=== All services starting ==="
echo "  Inference:    http://localhost:8001  (PID: $INFERENCE_PID)"
echo "  Complaint:    http://localhost:8002  (PID: $COMPLAINT_PID)"
echo "  Orchestrator: http://localhost:8000  (PID: $ORCHESTRATOR_PID)"
echo ""
echo ">>> Waiting for services to be ready (model loading takes a moment)..."
sleep 8

echo ""
echo "=== Health Checks ==="
echo -n "  Inference:    "; curl -s http://localhost:8001/v1/health | python3 -m json.tool 2>/dev/null || echo "NOT READY"
echo -n "  Complaint:    "; curl -s http://localhost:8002/v1/health | python3 -m json.tool 2>/dev/null || echo "NOT READY"
echo -n "  Orchestrator: "; curl -s http://localhost:8000/v1/health | python3 -m json.tool 2>/dev/null || echo "NOT READY"

echo ""
echo "=== READY! ==="
echo ""
echo "Test the full pipeline:"
echo "  curl -X POST http://localhost:8000/v1/process/image -F 'file=@ml-pipeline/output_detection.jpg' -F 'latitude=28.6139' -F 'longitude=77.209'"
echo ""
echo "Test just detection:"
echo "  curl -X POST http://localhost:8001/v1/detections/image -F 'file=@ml-pipeline/output_detection.jpg'"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C to kill all background jobs
trap "echo ''; echo 'Stopping all services...'; kill $INFERENCE_PID $COMPLAINT_PID $ORCHESTRATOR_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for all background processes
wait
