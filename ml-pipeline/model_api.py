from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import cv2
import numpy as np
import uuid

app = FastAPI()

model = YOLO("../runs/detect/train2/weights/best.pt")

@app.post("/detect")
async def detect_potholes(file: UploadFile = File(...)): 

    contents = await file.read()

    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(frame, conf=0.5)

    pothole_count = len(results[0].boxes)

    annotated = results[0].plot()

    output_name = f"result_{uuid.uuid4().hex}.jpg"
    cv2.imwrite(output_name, annotated)

    return {
        "potholes_detected": pothole_count,
        "result_image": output_name
    }