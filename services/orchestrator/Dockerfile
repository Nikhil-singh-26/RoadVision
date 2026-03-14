FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV ORCHESTRATOR_HOST=0.0.0.0
ENV ORCHESTRATOR_PORT=8000
ENV INFERENCE_SERVICE_URL=http://inference-service:8001
ENV COMPLAINT_SERVICE_URL=http://complaint-service:8002

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import requests; r=requests.get('http://localhost:8000/v1/health'); exit(0 if r.ok else 1)"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
