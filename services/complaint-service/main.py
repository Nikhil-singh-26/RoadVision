"""
Complaint Filing Service — FastAPI app.

Endpoints:
    POST /v1/complaints/file         — file a new complaint
    GET  /v1/complaints/{id}/status  — query complaint status
    GET  /v1/health                  — health check
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse

import config
from adapters.base import BaseAdapter, ComplaintData
from adapters.mock_adapter import MockAdapter
from adapters.human_adapter import HumanAdapter
from schemas import (
    FileComplaintRequest,
    FileComplaintResponse,
    ComplaintStatusResponse,
)

# ── App setup ──────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("complaint-service")

app = FastAPI(
    title="RoadVision Complaint Service",
    version="1.0.0",
    description="Automated grievance filing for detected potholes",
)

_start_time = time.time()


# ── Homepage ───────────────────────────────────────────

COMPLAINT_HTML = """<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RoadVision Complaint Service</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0e1a;color:#e2e8f0;min-height:100vh}
.bg{position:fixed;inset:0;background:radial-gradient(ellipse at 30% 70%,rgba(245,158,11,.05),transparent 60%),radial-gradient(ellipse at 70% 30%,rgba(239,68,68,.04),transparent 60%);z-index:0}
.c{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:2rem}
.hdr{text-align:center;padding:2.5rem 0 1.5rem}
.logo{font-size:2.5rem;font-weight:800;background:linear-gradient(135deg,#f59e0b,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sub{color:#94a3b8;margin-top:.4rem}
.badge{display:inline-block;padding:.2rem .6rem;border-radius:99px;font-size:.7rem;font-weight:600;margin-top:.75rem;background:rgba(245,158,11,.15);color:#f59e0b}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem;margin-top:1.5rem}
.card{background:rgba(30,41,59,.5);border:1px solid rgba(245,158,11,.12);border-radius:16px;padding:1.5rem;transition:all .3s}
.card:hover{border-color:rgba(245,158,11,.35);transform:translateY(-2px)}
.card h3{font-size:1rem;font-weight:600;margin-bottom:.75rem}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}
.inf{background:rgba(15,23,42,.6);border-radius:8px;padding:.75rem;text-align:center}
.inf .k{color:#64748b;font-size:.7rem;text-transform:uppercase;letter-spacing:.5px}
.inf .v{font-size:1.1rem;font-weight:600;margin-top:.25rem;color:#fbbf24}
.ep{background:rgba(15,23,42,.5);border-radius:6px;padding:.6rem .8rem;margin:.4rem 0;font-family:monospace;font-size:.82rem;display:flex;gap:.6rem;align-items:center}
.m{padding:.15rem .4rem;border-radius:3px;font-weight:700;font-size:.65rem}
.m.p{background:rgba(245,158,11,.12);color:#f59e0b}.m.g{background:rgba(59,130,246,.12);color:#3b82f6}
.adapter-card{background:rgba(15,23,42,.5);border-radius:10px;padding:1rem;margin:.5rem 0;border-left:3px solid}
.adapter-card.active{border-color:#22c55e}
.adapter-card.inactive{border-color:#475569}
.adapter-name{font-weight:600;font-size:.9rem}
.adapter-desc{color:#94a3b8;font-size:.8rem;margin-top:.25rem}
.ft{text-align:center;padding:2rem 0;color:#475569;font-size:.75rem}
</style></head><body>
<div class="bg"></div>
<div class="c">
  <div class="hdr">
    <div class="logo">📋 Complaint Service</div>
    <div class="sub">Automated Grievance Filing for Government Portals</div>
    <div class="badge">ADAPTER: """ + config.ADAPTER_TYPE.upper() + """</div>
  </div>
  <div class="info">
    <div class="inf"><div class="k">Active Adapter</div><div class="v">""" + config.ADAPTER_TYPE.capitalize() + """</div></div>
    <div class="inf"><div class="k">Status</div><div class="v" id="st">—</div></div>
    <div class="inf"><div class="k">Uptime</div><div class="v" id="up">—</div></div>
  </div>
  <div class="g">
    <div class="card">
      <h3>🔌 Available Adapters</h3>
      <div class="adapter-card """ + ("active" if config.ADAPTER_TYPE == "mock" else "inactive") + """">
        <div class="adapter-name">🧪 Mock Adapter</div>
        <div class="adapter-desc">Simulates complaint filing for development and testing. No external connections.</div>
      </div>
      <div class="adapter-card """ + ("active" if config.ADAPTER_TYPE == "pgportal" else "inactive") + """">
        <div class="adapter-name">🏛️ PG Portal (Browser Automation)</div>
        <div class="adapter-desc">Automates pgportal.gov.in via Playwright. Requires credentials in env vars.</div>
      </div>
      <div class="adapter-card """ + ("active" if config.ADAPTER_TYPE == "human" else "inactive") + """">
        <div class="adapter-name">👤 Human-in-the-Loop</div>
        <div class="adapter-desc">Creates JSON task files for manual submission by operators.</div>
      </div>
    </div>
    <div class="card">
      <h3>📡 API Endpoints</h3>
      <div class="ep"><span class="m p">POST</span>/v1/complaints/file</div>
      <div class="ep"><span class="m g">GET</span>/v1/complaints/{id}/status</div>
      <div class="ep"><span class="m g">GET</span>/v1/health</div>
      <div class="ep"><span class="m g">GET</span><a href="/docs" style="color:#94a3b8">/docs — Swagger UI</a></div>
      <h3 style="margin-top:1.25rem">🔄 Retry Configuration</h3>
      <div class="ep">Max Retries: <strong style="color:#fbbf24">""" + str(config.MAX_RETRIES) + """</strong></div>
      <div class="ep">Backoff Base: <strong style="color:#fbbf24">""" + str(config.RETRY_BACKOFF_BASE) + """s</strong></div>
      <h3 style="margin-top:1.25rem">🏛️ Target Portal</h3>
      <div class="ep" style="color:#94a3b8">pgportal.gov.in (CPGRAMS)</div>
      <div style="font-size:.75rem;color:#64748b;margin-top:.5rem;line-height:1.4">Note: PG Portal has no public API. The PG Portal adapter uses browser automation. Use Mock adapter for development.</div>
    </div>
  </div>
  <div class="ft">RoadVision Complaint Service v1.0 | Government Grievance Integration</div>
</div>
<script>
async function ck(){try{const r=await fetch('/v1/health');const d=await r.json();
  document.getElementById('st').textContent=d.status==='ok'?'✅ Online':'❌ Error';
  document.getElementById('up').textContent=Math.floor(d.uptime_seconds/60)+'m';
}catch(e){}}
ck();setInterval(ck,10000);
</script></body></html>"""


@app.get("/", response_class=HTMLResponse)
async def homepage():
    return COMPLAINT_HTML


# ── Adapter factory ────────────────────────────────────

def _get_adapter() -> BaseAdapter:
    """Return the configured adapter instance."""
    adapter_type = config.ADAPTER_TYPE.lower()
    if adapter_type == "mock":
        return MockAdapter()
    elif adapter_type == "pgportal":
        from adapters.pgportal_adapter import PGPortalAdapter
        return PGPortalAdapter()
    elif adapter_type == "human":
        return HumanAdapter()
    else:
        logger.warning(f"Unknown adapter type '{adapter_type}', falling back to mock")
        return MockAdapter()


# ── File Complaint ─────────────────────────────────────

@app.post("/v1/complaints/file", response_model=FileComplaintResponse)
async def file_complaint(req: FileComplaintRequest):
    """File a complaint with the configured grievance portal adapter."""
    adapter = _get_adapter()
    complaint_id = uuid.uuid4().hex

    # Authenticate
    auth_ok = await adapter.authenticate()
    if not auth_ok:
        raise HTTPException(
            status_code=503,
            detail="Failed to authenticate with grievance portal",
        )

    # Prepare complaint data
    data = ComplaintData(
        pothole_id=req.pothole_id,
        latitude=req.latitude,
        longitude=req.longitude,
        severity_level=req.severity_level,
        severity_score=req.severity_score,
        annotated_image_url=req.annotated_image_url,
        description=req.description,
        road_name=req.road_name,
        detection_id=req.detection_id,
    )

    # File with retries + exponential backoff
    last_error = None
    for attempt in range(1, config.MAX_RETRIES + 1):
        try:
            result = await adapter.create_complaint(data)
            if result.success:
                return FileComplaintResponse(
                    success=True,
                    complaint_id=complaint_id,
                    external_id=result.external_id,
                    portal_name=result.portal_name,
                    message=result.message,
                    filed_at=datetime.now(timezone.utc),
                )
            else:
                last_error = result.message
                logger.warning(
                    f"Attempt {attempt}/{config.MAX_RETRIES} failed: {result.message}"
                )
        except Exception as e:
            last_error = str(e)
            logger.error(f"Attempt {attempt}/{config.MAX_RETRIES} error: {e}")

        if attempt < config.MAX_RETRIES:
            wait = config.RETRY_BACKOFF_BASE ** attempt
            logger.info(f"Retrying in {wait}s...")
            await asyncio.sleep(wait)

    return FileComplaintResponse(
        success=False,
        complaint_id=complaint_id,
        portal_name=config.ADAPTER_TYPE,
        message=f"All {config.MAX_RETRIES} attempts failed. Last error: {last_error}",
        filed_at=datetime.now(timezone.utc),
    )


# ── Query Status ───────────────────────────────────────

@app.get("/v1/complaints/{external_id}/status", response_model=ComplaintStatusResponse)
async def complaint_status(external_id: str):
    """Query the status of a previously filed complaint."""
    adapter = _get_adapter()
    status = await adapter.query_status(external_id)
    return ComplaintStatusResponse(
        external_id=status.external_id,
        status=status.status,
        last_update=status.last_update,
        details=status.details,
    )


# ── Health ─────────────────────────────────────────────

@app.get("/v1/health")
async def health():
    return {
        "status": "ok",
        "adapter": config.ADAPTER_TYPE,
        "uptime_seconds": round(time.time() - _start_time, 1),
    }


# ── Run ────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=True)
