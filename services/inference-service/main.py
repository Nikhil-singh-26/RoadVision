"""
FastAPI Inference Service — Pothole Detection via YOLOv8.

Endpoints:
    POST /v1/detections/image   — detect potholes in an uploaded image
    POST /v1/detections/video   — detect potholes in an uploaded video
    GET  /v1/detections/{id}    — (placeholder) get a past detection by ID
    GET  /v1/health             — health / readiness check
"""

from __future__ import annotations

import io
import logging
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image

import config
import detector
import severity as sev
import geo as geo_mod
from schemas import (
    BoundingBox,
    FrameDetection,
    GeoLocation,
    HealthResponse,
    ImageDetectionResponse,
    PotholeDetection,
    VideoDetectionResponse,
)

# ── App setup ──────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("inference-service")

app = FastAPI(
    title="RoadVision Inference Service",
    version="1.0.0",
    description="YOLOv8-based pothole detection API",
)

# CORS — allow browser requests from the React frontend
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_start_time = time.time()

# Ensure storage directory exists
os.makedirs(config.STORAGE_DIR, exist_ok=True)

# Serve annotated images as static files
app.mount(
    config.STORAGE_URL_PREFIX,
    StaticFiles(directory=config.STORAGE_DIR),
    name="detections",
)


# ── Startup ────────────────────────────────────────────

@app.on_event("startup")
async def on_startup():
    """Pre-load the model so the first request isn't slow."""
    try:
        detector.load_model()
        logger.info("Model pre-loaded successfully")
    except Exception as e:
        logger.error(f"Failed to pre-load model: {e}")


# ── Homepage ───────────────────────────────────────────

INFERENCE_HTML = """<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RoadVision Inference Service</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0e1a;color:#e2e8f0;min-height:100vh}
.bg{position:fixed;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(16,185,129,.06),transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(99,102,241,.06),transparent 60%);z-index:0}
.c{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:2rem}
.hdr{text-align:center;padding:2.5rem 0 1.5rem}
.logo{font-size:2.5rem;font-weight:800;background:linear-gradient(135deg,#10b981,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sub{color:#94a3b8;margin-top:.4rem}
.badge{display:inline-block;padding:.2rem .6rem;border-radius:99px;font-size:.7rem;font-weight:600;margin-top:.75rem}
.badge.ok{background:rgba(16,185,129,.15);color:#10b981}
.badge.err{background:rgba(239,68,68,.15);color:#ef4444}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem;margin-top:1.5rem}
.card{background:rgba(30,41,59,.5);border:1px solid rgba(16,185,129,.12);border-radius:16px;padding:1.5rem;transition:all .3s}
.card:hover{border-color:rgba(16,185,129,.35);transform:translateY(-2px)}
.card h3{font-size:1rem;font-weight:600;margin-bottom:.75rem}
.info{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.inf{background:rgba(15,23,42,.6);border-radius:8px;padding:.75rem}
.inf .k{color:#64748b;font-size:.7rem;text-transform:uppercase;letter-spacing:.5px}
.inf .v{font-size:1rem;font-weight:600;margin-top:.25rem;color:#10b981}
.upload{border:2px dashed rgba(16,185,129,.25);border-radius:12px;padding:2rem;text-align:center;cursor:pointer;transition:all .3s}
.upload:hover{border-color:#10b981;background:rgba(16,185,129,.04)}
.upload input{display:none}
.btn{background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:8px;font-weight:600;cursor:pointer;width:100%;margin-top:.75rem;transition:all .2s}
.btn:hover{box-shadow:0 4px 15px rgba(16,185,129,.3)}
.btn:disabled{opacity:.5}
.res{background:rgba(15,23,42,.8);border:1px solid rgba(16,185,129,.15);border-radius:8px;padding:1rem;margin-top:1rem;max-height:400px;overflow-y:auto;font-family:monospace;font-size:.8rem;white-space:pre-wrap;display:none}
.ep{background:rgba(15,23,42,.5);border-radius:6px;padding:.6rem .8rem;margin:.4rem 0;font-family:monospace;font-size:.82rem;display:flex;gap:.6rem;align-items:center}
.m{padding:.15rem .4rem;border-radius:3px;font-weight:700;font-size:.65rem}
.m.p{background:rgba(34,197,94,.12);color:#22c55e}.m.g{background:rgba(59,130,246,.12);color:#3b82f6}
.ft{text-align:center;padding:2rem 0;color:#475569;font-size:.75rem}
</style></head><body>
<div class="bg"></div>
<div class="c">
  <div class="hdr">
    <div class="logo">🤖 Inference Service</div>
    <div class="sub">YOLOv8 Pothole Detection Engine</div>
    <div class="badge" id="status">Checking...</div>
  </div>
  <div class="info">
    <div class="inf"><div class="k">Model</div><div class="v" id="m-path">—</div></div>
    <div class="inf"><div class="k">Classes</div><div class="v" id="m-cls">—</div></div>
    <div class="inf"><div class="k">Status</div><div class="v" id="m-stat">—</div></div>
    <div class="inf"><div class="k">Uptime</div><div class="v" id="m-up">—</div></div>
  </div>
  <div class="g">
    <div class="card">
      <h3>📷 Quick Image Detection</h3>
      <form id="frm">
        <div class="upload" onclick="document.getElementById('fi').click()">
          <input type="file" id="fi" accept="image/*">
          <div style="font-size:1.8rem">📁</div>
          <div style="color:#94a3b8;margin-top:.3rem">Click to upload an image</div>
          <div id="fn" style="color:#34d399;margin-top:.4rem;font-weight:500"></div>
        </div>
        <button type="submit" class="btn" id="sb">🔍 Detect Potholes</button>
      </form>
      <div class="res" id="rb"></div>
    </div>
    <div class="card">
      <h3>📡 API Endpoints</h3>
      <div class="ep"><span class="m p">POST</span>/v1/detections/image</div>
      <div class="ep"><span class="m p">POST</span>/v1/detections/video</div>
      <div class="ep"><span class="m g">GET</span>/v1/health</div>
      <div class="ep"><span class="m g">GET</span><a href="/docs" style="color:#94a3b8">/docs — Swagger UI</a></div>
      <h3 style="margin-top:1.25rem">⚙️ Configuration</h3>
      <div class="ep">Confidence: <strong style="color:#10b981">""" + str(config.CONFIDENCE_THRESHOLD) + """</strong></div>
      <div class="ep">IoU: <strong style="color:#10b981">""" + str(config.IOU_THRESHOLD) + """</strong></div>
      <div class="ep">Image Size: <strong style="color:#10b981">""" + str(config.IMAGE_SIZE) + """</strong></div>
    </div>
  </div>
  <div class="ft">RoadVision Inference Service v1.0 | Powered by Ultralytics YOLOv8</div>
</div>
<script>
document.getElementById('fi').addEventListener('change',e=>{if(e.target.files[0])document.getElementById('fn').textContent='📎 '+e.target.files[0].name});
document.getElementById('frm').addEventListener('submit',async e=>{
  e.preventDefault();const f=document.getElementById('fi').files[0];if(!f){alert('Pick an image');return}
  const btn=document.getElementById('sb'),rb=document.getElementById('rb');
  btn.disabled=true;btn.textContent='⏳ Detecting...';rb.style.display='block';rb.textContent='Processing...';
  const fd=new FormData();fd.append('file',f);
  try{const r=await fetch('/v1/detections/image',{method:'POST',body:fd});const j=await r.json();rb.textContent=JSON.stringify(j,null,2)}
  catch(err){rb.textContent='Error: '+err.message}
  btn.disabled=false;btn.textContent='🔍 Detect Potholes';
});
async function ck(){try{const r=await fetch('/v1/health');const d=await r.json();
  const s=document.getElementById('status');s.textContent=d.model_loaded?'● MODEL LOADED':'● MODEL ERROR';
  s.className='badge '+(d.model_loaded?'ok':'err');
  document.getElementById('m-path').textContent=d.model_path.split('/').pop();
  document.getElementById('m-cls').textContent=(d.model_classes||[]).join(', ')||'—';
  document.getElementById('m-stat').textContent=d.model_loaded?'Ready':'Error';
  document.getElementById('m-up').textContent=Math.floor(d.uptime_seconds/60)+'m '+Math.floor(d.uptime_seconds%60)+'s';
}catch(e){}}
ck();setInterval(ck,10000);
</script></body></html>"""


@app.get("/", response_class=HTMLResponse)
async def homepage():
    return INFERENCE_HTML


# ── Helpers ────────────────────────────────────────────

def _save_image(img: np.ndarray, detection_id: str) -> str:
    """Save an annotated image and return its URL path."""
    now = datetime.now(timezone.utc)
    sub_dir = os.path.join(config.STORAGE_DIR, now.strftime("%Y"), now.strftime("%m"))
    os.makedirs(sub_dir, exist_ok=True)
    filename = f"{detection_id}.jpg"
    filepath = os.path.join(sub_dir, filename)
    cv2.imwrite(filepath, img)
    relative = os.path.relpath(filepath, config.STORAGE_DIR)
    return f"{config.STORAGE_URL_PREFIX}/{relative}"


def _process_detections(
    raw_detections: list, img_w: int, img_h: int
) -> list[PotholeDetection]:
    """Convert raw detector output to PotholeDetection schemas."""
    potholes = []
    for x1, y1, x2, y2, conf, cls_name in raw_detections:
        score, level = sev.score_pothole(x1, y1, x2, y2, conf, img_w, img_h)
        potholes.append(
            PotholeDetection(
                bbox=BoundingBox(
                    x1=x1, y1=y1, x2=x2, y2=y2,
                    confidence=conf, class_name=cls_name,
                ),
                severity_score=score,
                severity_level=level,
            )
        )
    return potholes


# ── Image Detection ────────────────────────────────────

@app.post("/v1/detections/image", response_model=ImageDetectionResponse)
async def detect_image(
    file: UploadFile = File(...),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
):
    """Detect potholes in an uploaded image (jpg/png/webp)."""
    detection_id = uuid.uuid4().hex
    created_at = datetime.now(timezone.utc)

    # Read image bytes
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    img_h, img_w = frame.shape[:2]

    # Try to extract GPS from EXIF
    geo_data = None
    try:
        pil_img = Image.open(io.BytesIO(contents))
        geo_data = geo_mod.extract_gps(pil_img)
    except Exception:
        pass

    # Allow manual lat/lon override
    if latitude is not None and longitude is not None:
        geo_data = GeoLocation(latitude=latitude, longitude=longitude)

    # Run inference
    annotated, raw_detections = detector.annotate_frame(frame)
    potholes = _process_detections(raw_detections, img_w, img_h)

    # Save annotated image
    annotated_url = _save_image(annotated, detection_id)

    # Aggregate stats
    conf_avg = (
        sum(p.bbox.confidence for p in potholes) / len(potholes)
        if potholes
        else 0.0
    )
    if potholes:
        overall_score = max(p.severity_score for p in potholes)
    else:
        overall_score = 0
    overall_level = (
        "high" if overall_score >= config.SEVERITY_HIGH_THRESHOLD
        else "medium" if overall_score >= config.SEVERITY_MEDIUM_THRESHOLD
        else "low"
    )

    model_info = detector.get_model_info()

    return ImageDetectionResponse(
        detection_id=detection_id,
        created_at=created_at,
        source_filename=file.filename or "unknown",
        geo=geo_data,
        potholes=potholes,
        pothole_count=len(potholes),
        confidence_avg=round(conf_avg, 4),
        overall_severity_score=overall_score,
        overall_severity_level=overall_level,
        annotated_image_url=annotated_url,
        model_version=model_info["model_version"],
    )


# ── Video Detection ────────────────────────────────────

@app.post("/v1/detections/video", response_model=VideoDetectionResponse)
async def detect_video(
    file: UploadFile = File(...),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    sample_every_n: int = Form(5, description="Process every Nth frame to save time"),
):
    """Detect potholes in an uploaded video (mp4/avi)."""
    detection_id = uuid.uuid4().hex
    created_at = datetime.now(timezone.utc)

    # Save uploaded video to temp file
    import tempfile

    suffix = Path(file.filename or "video.mp4").suffix
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file")

        fps = cap.get(cv2.CAP_PROP_FPS) or 20.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # Prepare output video writer
        now = datetime.now(timezone.utc)
        sub_dir = os.path.join(config.STORAGE_DIR, now.strftime("%Y"), now.strftime("%m"))
        os.makedirs(sub_dir, exist_ok=True)
        out_path = os.path.join(sub_dir, f"{detection_id}.mp4")
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out_writer = cv2.VideoWriter(out_path, fourcc, fps, (width, height))

        frame_detections: list[FrameDetection] = []
        total_potholes = 0
        all_confs: list[float] = []
        all_severities: list[int] = []
        frame_number = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_number % sample_every_n == 0:
                annotated, raw_dets = detector.annotate_frame(frame)
                potholes = _process_detections(raw_dets, width, height)

                if potholes:
                    frame_detections.append(
                        FrameDetection(
                            frame_number=frame_number,
                            timestamp_sec=round(frame_number / fps, 2),
                            potholes=potholes,
                        )
                    )
                    total_potholes += len(potholes)
                    all_confs.extend(p.bbox.confidence for p in potholes)
                    all_severities.extend(p.severity_score for p in potholes)

                out_writer.write(annotated)
            else:
                out_writer.write(frame)

            frame_number += 1

        cap.release()
        out_writer.release()

    finally:
        os.unlink(tmp_path)

    # Geo
    geo_data = None
    if latitude is not None and longitude is not None:
        geo_data = GeoLocation(latitude=latitude, longitude=longitude)

    # Aggregates
    conf_avg = sum(all_confs) / len(all_confs) if all_confs else 0.0
    overall_score = max(all_severities) if all_severities else 0
    overall_level = (
        "high" if overall_score >= config.SEVERITY_HIGH_THRESHOLD
        else "medium" if overall_score >= config.SEVERITY_MEDIUM_THRESHOLD
        else "low"
    )

    relative = os.path.relpath(out_path, config.STORAGE_DIR)
    annotated_video_url = f"{config.STORAGE_URL_PREFIX}/{relative}"

    model_info = detector.get_model_info()

    return VideoDetectionResponse(
        detection_id=detection_id,
        created_at=created_at,
        source_filename=file.filename or "unknown",
        geo=geo_data,
        total_frames_processed=frame_number,
        frames_with_potholes=len(frame_detections),
        total_potholes_detected=total_potholes,
        confidence_avg=round(conf_avg, 4),
        overall_severity_score=overall_score,
        overall_severity_level=overall_level,
        annotated_video_url=annotated_video_url,
        frame_detections=frame_detections,
        model_version=model_info["model_version"],
    )


# ── Health ─────────────────────────────────────────────

@app.get("/v1/health", response_model=HealthResponse)
async def health():
    """Health / readiness check."""
    try:
        info = detector.get_model_info()
        model_loaded = True
    except Exception:
        info = {"model_path": config.MODEL_PATH, "classes": []}
        model_loaded = False

    return HealthResponse(
        status="ok" if model_loaded else "degraded",
        model_loaded=model_loaded,
        model_path=info["model_path"],
        model_classes=info["classes"],
        uptime_seconds=round(time.time() - _start_time, 1),
    )


# ── Run ────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=True)
