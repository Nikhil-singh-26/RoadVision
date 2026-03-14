FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV COMPLAINT_ADAPTER=mock
ENV COMPLAINT_HOST=0.0.0.0
ENV COMPLAINT_PORT=8002

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import requests; r=requests.get('http://localhost:8002/v1/health'); exit(0 if r.ok else 1)"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
