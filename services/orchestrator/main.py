"""
Orchestrator — the "brain" that coordinates the detection → complaint flow.

Endpoints:
    POST /v1/process/image   — upload image, detect, file complaint if potholes found
    POST /v1/process/video   — upload video, detect, file complaint if potholes found
    GET  /v1/health          — health check
"""

from __future__ import annotations

import logging
import time

import httpx
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import HTMLResponse

import config

# ── App setup ──────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("orchestrator")

app = FastAPI(
    title="RoadVision Orchestrator",
    version="1.0.0",
    description="Coordinates detection → complaint filing pipeline",
)

_start_time = time.time()


# ── Homepage Dashboard ─────────────────────────────────

HOMEPAGE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RoadVision Orchestrator</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0e1a;color:#e2e8f0;min-height:100vh;overflow-x:hidden}
.bg-grid{position:fixed;inset:0;background-image:radial-gradient(rgba(99,102,241,.08) 1px,transparent 1px);background-size:40px 40px;z-index:0}
.container{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:2rem}
.header{text-align:center;padding:3rem 0 2rem}
.logo{font-size:3rem;font-weight:800;background:linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-1px}
.subtitle{color:#94a3b8;font-size:1.1rem;margin-top:.5rem;font-weight:300}
.badge{display:inline-block;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:.25rem .75rem;border-radius:99px;font-size:.75rem;font-weight:600;margin-top:1rem;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:1.5rem;margin-top:2rem}
.card{background:rgba(30,41,59,.6);border:1px solid rgba(99,102,241,.15);border-radius:16px;padding:1.5rem;backdrop-filter:blur(10px);transition:all .3s ease}
.card:hover{border-color:rgba(99,102,241,.4);transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,.1)}
.card h3{font-size:1.1rem;font-weight:600;margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem}
.card h3 .icon{font-size:1.3rem}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:2rem}
.stat{background:rgba(30,41,59,.6);border:1px solid rgba(99,102,241,.1);border-radius:12px;padding:1.25rem;text-align:center}
.stat .num{font-size:2rem;font-weight:700;background:linear-gradient(135deg,#6366f1,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat .label{color:#94a3b8;font-size:.8rem;margin-top:.25rem}
.endpoint{background:rgba(15,23,42,.5);border-radius:8px;padding:.75rem 1rem;margin:.5rem 0;font-family:'Courier New',monospace;font-size:.85rem;display:flex;align-items:center;gap:.75rem}
.method{padding:.2rem .5rem;border-radius:4px;font-weight:700;font-size:.7rem}
.method.post{background:rgba(34,197,94,.15);color:#22c55e}
.method.get{background:rgba(59,130,246,.15);color:#3b82f6}
.upload-zone{border:2px dashed rgba(99,102,241,.3);border-radius:12px;padding:2rem;text-align:center;cursor:pointer;transition:all .3s}
.upload-zone:hover{border-color:#6366f1;background:rgba(99,102,241,.05)}
.upload-zone input{display:none}
.btn{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;padding:.75rem 2rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;transition:all .2s}
.btn:hover{transform:translateY(-1px);box-shadow:0 4px 15px rgba(99,102,241,.4)}
.btn:disabled{opacity:.5;cursor:not-allowed}
select,input[type=number]{background:rgba(15,23,42,.8);border:1px solid rgba(99,102,241,.2);color:#e2e8f0;padding:.5rem .75rem;border-radius:6px;font-size:.85rem;width:100%}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1rem 0}
label{font-size:.8rem;color:#94a3b8;margin-bottom:.25rem;display:block}
.result-box{background:rgba(15,23,42,.8);border:1px solid rgba(99,102,241,.2);border-radius:8px;padding:1rem;margin-top:1rem;max-height:400px;overflow-y:auto;font-family:'Courier New',monospace;font-size:.8rem;white-space:pre-wrap;display:none}
.flow{display:flex;align-items:center;justify-content:center;gap:.5rem;flex-wrap:wrap;margin:1rem 0}
.flow-step{background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);padding:.5rem 1rem;border-radius:8px;font-size:.8rem;font-weight:500}
.flow-arrow{color:#6366f1;font-weight:bold}
.health-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:.5rem}
.health-dot.ok{background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,.5)}
.health-dot.err{background:#ef4444;box-shadow:0 0 8px rgba(239,68,68,.5)}
.footer{text-align:center;padding:3rem 0 2rem;color:#475569;font-size:.8rem}
</style>
</head>
<body>
<div class="bg-grid"></div>
<div class="container">
  <div class="header">
    <div class="logo">🛣️ RoadVision Orchestrator</div>
    <div class="subtitle">AI-Powered Pothole Detection & Automated Complaint Filing</div>
    <div class="badge">● SYSTEM ONLINE</div>
  </div>

  <div class="stat-grid">
    <div class="stat"><div class="num" id="s-inference">—</div><div class="label">Inference Service</div></div>
    <div class="stat"><div class="num" id="s-complaint">—</div><div class="label">Complaint Service</div></div>
    <div class="stat"><div class="num" id="s-uptime">—</div><div class="label">Uptime</div></div>
  </div>

  <div class="grid">
    <div class="card">
      <h3><span class="icon">🔬</span> Pipeline Flow</h3>
      <div class="flow">
        <div class="flow-step">📷 Upload</div><div class="flow-arrow">→</div>
        <div class="flow-step">🤖 YOLOv8 Detect</div><div class="flow-arrow">→</div>
        <div class="flow-step">📊 Score Severity</div><div class="flow-arrow">→</div>
        <div class="flow-step">📋 File Complaint</div>
      </div>
      <div class="endpoint"><span class="method post">POST</span>/v1/process/image</div>
      <div class="endpoint"><span class="method post">POST</span>/v1/process/video</div>
      <div class="endpoint"><span class="method get">GET</span>/v1/health</div>
      <div class="endpoint"><span class="method get">GET</span><a href="/docs" style="color:#94a3b8">/docs — Interactive API</a></div>
    </div>

    <div class="card">
      <h3><span class="icon">🚀</span> Quick Test — Full Pipeline</h3>
      <form id="uploadForm">
        <div class="upload-zone" id="dropZone" onclick="document.getElementById('fileInput').click()">
          <input type="file" id="fileInput" accept="image/*,video/*">
          <div style="font-size:2rem;margin-bottom:.5rem">📁</div>
          <div style="color:#94a3b8">Drop image/video or click to upload</div>
          <div id="fileName" style="color:#a78bfa;margin-top:.5rem;font-weight:500"></div>
        </div>
        <div class="form-row">
          <div><label>Latitude</label><input type="number" id="lat" step="any" value="28.6139"></div>
          <div><label>Longitude</label><input type="number" id="lon" step="any" value="77.209"></div>
        </div>
        <button type="submit" class="btn" id="submitBtn" style="width:100%;margin-top:.5rem">⚡ Run Detection Pipeline</button>
      </form>
      <div class="result-box" id="resultBox"></div>
    </div>
  </div>

  <div class="grid" style="margin-top:1.5rem">
    <div class="card">
      <h3><span class="icon">🔗</span> Connected Services</h3>
      <div style="margin:.5rem 0"><span class="health-dot" id="hd-inf"></span><strong>Inference Service</strong> — <a href="http://localhost:8001" style="color:#a78bfa">:8001</a></div>
      <div style="margin:.5rem 0"><span class="health-dot" id="hd-comp"></span><strong>Complaint Service</strong> — <a href="http://localhost:8002" style="color:#a78bfa">:8002</a></div>
      <div style="margin:.5rem 0"><span class="health-dot" id="hd-be"></span><strong>Node.js Backend</strong> — <a href="http://localhost:5000/api/health" style="color:#a78bfa">:5000</a></div>
      <div style="margin:.5rem 0"><span class="health-dot" id="hd-fe"></span><strong>React Frontend</strong> — <a href="http://localhost:5173" style="color:#a78bfa">:5173</a></div>
    </div>
    <div class="card">
      <h3><span class="icon">📖</span> Architecture</h3>
      <div style="font-size:.85rem;color:#94a3b8;line-height:1.6">
        <p>The Orchestrator is the single entry point for the pothole detection pipeline.</p>
        <p style="margin-top:.5rem">It receives an image or video upload, forwards it to the <strong style="color:#a78bfa">Inference Service</strong> (YOLOv8), and if potholes are detected, automatically files a complaint via the <strong style="color:#a78bfa">Complaint Service</strong>.</p>
        <p style="margin-top:.5rem">Complaint adapters: <strong style="color:#22c55e">Mock</strong> (dev), <strong style="color:#eab308">Browser Automation</strong> (PG Portal), <strong style="color:#3b82f6">Human-in-the-Loop</strong> (fallback).</p>
      </div>
    </div>
  </div>

  <div class="footer">RoadVision v1.0 — Ministry of Road Transport & Highways | Powered by YOLOv8</div>
</div>
<script>
const fileInput=document.getElementById('fileInput'),fileName=document.getElementById('fileName');
fileInput.addEventListener('change',e=>{if(e.target.files[0])fileName.textContent='📎 '+e.target.files[0].name});
document.getElementById('uploadForm').addEventListener('submit',async e=>{
  e.preventDefault();const btn=document.getElementById('submitBtn'),rb=document.getElementById('resultBox');
  const f=fileInput.files[0];if(!f){alert('Pick a file first');return}
  btn.disabled=true;btn.textContent='⏳ Processing...';rb.style.display='block';rb.textContent='Running pipeline...';
  const fd=new FormData();fd.append('file',f);fd.append('latitude',document.getElementById('lat').value);fd.append('longitude',document.getElementById('lon').value);
  const isVideo=f.type.startsWith('video');const url=isVideo?'/v1/process/video':'/v1/process/image';
  try{const r=await fetch(url,{method:'POST',body:fd});const j=await r.json();rb.textContent=JSON.stringify(j,null,2)}
  catch(err){rb.textContent='Error: '+err.message}
  btn.disabled=false;btn.textContent='⚡ Run Detection Pipeline';
});
async function checkHealth(){
  try{const r=await fetch('/v1/health');const d=await r.json();
    document.getElementById('s-inference').textContent=d.downstream?.inference_service==='ok'?'✅ Online':'❌ Offline';
    document.getElementById('s-complaint').textContent=d.downstream?.complaint_service==='ok'?'✅ Online':'❌ Offline';
    document.getElementById('s-uptime').textContent=Math.floor(d.uptime_seconds/60)+'m';
    document.getElementById('hd-inf').className='health-dot '+(d.downstream?.inference_service==='ok'?'ok':'err');
    document.getElementById('hd-comp').className='health-dot '+(d.downstream?.complaint_service==='ok'?'ok':'err');
  }catch(e){}}
async function checkExternal(){
  try{await fetch('http://localhost:5000/api/health');document.getElementById('hd-be').className='health-dot ok'}catch(e){document.getElementById('hd-be').className='health-dot err'}
  try{await fetch('http://localhost:5173');document.getElementById('hd-fe').className='health-dot ok'}catch(e){document.getElementById('hd-fe').className='health-dot err'}
}
checkHealth();setInterval(checkHealth,10000);checkExternal();
</script>
</body></html>"""


@app.get("/", response_class=HTMLResponse)
async def homepage():
    return HOMEPAGE_HTML


# ── Process Image ──────────────────────────────────────

@app.post("/v1/process/image")
async def process_image(
    file: UploadFile = File(...),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
):
    """
    Full pipeline: upload image → detect potholes → file complaint if found.
    """
    contents = await file.read()

    # Step 1: Send to inference service
    logger.info(f"Sending image '{file.filename}' to inference service...")
    async with httpx.AsyncClient(timeout=120.0) as client:
        form_data = {"file": (file.filename, contents, file.content_type or "image/jpeg")}
        data = {}
        if latitude is not None:
            data["latitude"] = str(latitude)
        if longitude is not None:
            data["longitude"] = str(longitude)

        resp = await client.post(
            f"{config.INFERENCE_SERVICE_URL}/v1/detections/image",
            files=form_data,
            data=data,
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Inference service error: {resp.text}",
        )

    detection = resp.json()
    pothole_count = detection.get("pothole_count", 0)
    logger.info(f"Detection complete: {pothole_count} potholes found")

    # Step 2: If potholes detected → file complaint
    complaint_result = None
    if pothole_count > 0:
        logger.info("Potholes detected — filing complaint...")
        complaint_payload = {
            "pothole_id": detection["detection_id"],
            "detection_id": detection["detection_id"],
            "latitude": detection.get("geo", {}).get("latitude", latitude) or 0.0,
            "longitude": detection.get("geo", {}).get("longitude", longitude) or 0.0,
            "severity_level": detection["overall_severity_level"],
            "severity_score": detection["overall_severity_score"],
            "annotated_image_url": detection["annotated_image_url"],
            "description": (
                f"Automated pothole detection report.\n"
                f"Potholes found: {pothole_count}\n"
                f"Overall severity: {detection['overall_severity_level']} "
                f"(score: {detection['overall_severity_score']}/100)\n"
                f"Average confidence: {detection['confidence_avg']}"
            ),
            "road_name": detection.get("geo", {}).get("road_name") if detection.get("geo") else None,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{config.COMPLAINT_SERVICE_URL}/v1/complaints/file",
                json=complaint_payload,
            )

        if resp.status_code == 200:
            complaint_result = resp.json()
            logger.info(
                f"Complaint filed: {complaint_result.get('external_id', 'N/A')}"
            )
        else:
            logger.error(f"Complaint filing failed: {resp.text}")
            complaint_result = {"error": resp.text}

    return {
        "detection": detection,
        "complaint": complaint_result,
        "summary": {
            "potholes_detected": pothole_count,
            "complaint_filed": complaint_result is not None and "error" not in (complaint_result or {}),
        },
    }


# ── Process Video ──────────────────────────────────────

@app.post("/v1/process/video")
async def process_video(
    file: UploadFile = File(...),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    sample_every_n: int = Form(5),
):
    """
    Full pipeline: upload video → detect potholes → file complaint if found.
    """
    contents = await file.read()

    # Step 1: Send to inference service
    logger.info(f"Sending video '{file.filename}' to inference service...")
    async with httpx.AsyncClient(timeout=600.0) as client:
        form_data = {"file": (file.filename, contents, file.content_type or "video/mp4")}
        data = {"sample_every_n": str(sample_every_n)}
        if latitude is not None:
            data["latitude"] = str(latitude)
        if longitude is not None:
            data["longitude"] = str(longitude)

        resp = await client.post(
            f"{config.INFERENCE_SERVICE_URL}/v1/detections/video",
            files=form_data,
            data=data,
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Inference service error: {resp.text}",
        )

    detection = resp.json()
    pothole_count = detection.get("total_potholes_detected", 0)
    logger.info(f"Detection complete: {pothole_count} total potholes across video")

    # Step 2: File complaint if potholes found
    complaint_result = None
    if pothole_count > 0:
        logger.info("Potholes detected in video — filing complaint...")
        complaint_payload = {
            "pothole_id": detection["detection_id"],
            "detection_id": detection["detection_id"],
            "latitude": detection.get("geo", {}).get("latitude", latitude) or 0.0,
            "longitude": detection.get("geo", {}).get("longitude", longitude) or 0.0,
            "severity_level": detection["overall_severity_level"],
            "severity_score": detection["overall_severity_score"],
            "annotated_image_url": detection["annotated_video_url"],
            "description": (
                f"Automated pothole detection from video.\n"
                f"Total potholes: {pothole_count}\n"
                f"Frames with potholes: {detection['frames_with_potholes']}\n"
                f"Overall severity: {detection['overall_severity_level']} "
                f"(score: {detection['overall_severity_score']}/100)"
            ),
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{config.COMPLAINT_SERVICE_URL}/v1/complaints/file",
                json=complaint_payload,
            )

        if resp.status_code == 200:
            complaint_result = resp.json()
            logger.info(
                f"Complaint filed: {complaint_result.get('external_id', 'N/A')}"
            )
        else:
            logger.error(f"Complaint filing failed: {resp.text}")
            complaint_result = {"error": resp.text}

    return {
        "detection": detection,
        "complaint": complaint_result,
        "summary": {
            "potholes_detected": pothole_count,
            "complaint_filed": complaint_result is not None and "error" not in (complaint_result or {}),
        },
    }


# ── Health ─────────────────────────────────────────────

@app.get("/v1/health")
async def health():
    """Check health of this service + downstream services."""
    inference_ok = False
    complaint_ok = False

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            r = await client.get(f"{config.INFERENCE_SERVICE_URL}/v1/health")
            inference_ok = r.status_code == 200
        except Exception:
            pass
        try:
            r = await client.get(f"{config.COMPLAINT_SERVICE_URL}/v1/health")
            complaint_ok = r.status_code == 200
        except Exception:
            pass

    return {
        "status": "ok" if (inference_ok and complaint_ok) else "degraded",
        "uptime_seconds": round(time.time() - _start_time, 1),
        "downstream": {
            "inference_service": "ok" if inference_ok else "unreachable",
            "complaint_service": "ok" if complaint_ok else "unreachable",
        },
    }


# ── Run ────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=True)
