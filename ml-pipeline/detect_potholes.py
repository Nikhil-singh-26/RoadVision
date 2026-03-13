from ultralytics import YOLO
import cv2
import csv
import sys
import os

# load trained model
model = YOLO("../runs/detect/train2/weights/best.pt")

# check input argument
if len(sys.argv) < 2:
    print("Usage: python detect_potholes.py <image_or_video>")
    sys.exit()

input_path = sys.argv[1]

# CSV file to store pothole coordinates
csv_file = open("potholes.csv", "w", newline="")
writer = csv.writer(csv_file)
writer.writerow(["frame", "x", "y", "confidence"])

frame_number = 0

# supported image extensions
image_exts = [".jpg", ".jpeg", ".png"]

# determine file type
ext = os.path.splitext(input_path)[1].lower()

# ---------------- IMAGE MODE ----------------
if ext in image_exts:

    frame = cv2.imread(input_path)

    if frame is None:
        print("Error: Could not read image.")
        sys.exit()

    results = model(frame)

    for r in results:
        boxes = r.boxes.xyxy
        confs = r.boxes.conf

        for box, conf in zip(boxes, confs):

            x1, y1, x2, y2 = box.tolist()

            cx = (x1 + x2) / 2
            cy = (y1 + y2) / 2

            writer.writerow([0, cx, cy, float(conf)])

            print(f"Pothole at ({cx:.2f}, {cy:.2f}) confidence {conf:.2f}")

    annotated = results[0].plot()

    # save detection image
    cv2.imwrite("output_detection.jpg", annotated)

    print("Detection image saved as output_detection.jpg")


# ---------------- VIDEO MODE ----------------
else:

    cap = cv2.VideoCapture(input_path)

    if not cap.isOpened():
        print("Error: Could not open video.")
        sys.exit()

    # video writer
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter("output_detection.mp4", fourcc, 20.0,
                          (int(cap.get(3)), int(cap.get(4))))

    while True:

        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)

        for r in results:
            boxes = r.boxes.xyxy
            confs = r.boxes.conf

            for box, conf in zip(boxes, confs):

                x1, y1, x2, y2 = box.tolist()

                cx = (x1 + x2) / 2
                cy = (y1 + y2) / 2

                writer.writerow([frame_number, cx, cy, float(conf)])

                print(f"Frame {frame_number} pothole at ({cx:.2f}, {cy:.2f}) confidence {conf:.2f}")

        annotated = results[0].plot()

        out.write(annotated)

        frame_number += 1

    cap.release()
    out.release()

    print("Detection video saved as output_detection.mp4")


csv_file.close()

print("Pothole coordinates saved to potholes.csv")
print("Detection complete.")