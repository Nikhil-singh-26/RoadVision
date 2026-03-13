from ultralytics import YOLO

model = YOLO("yolov8n.pt")

image_path = "pizza.png"

results = model(image_path, save=True)

results[0].show()