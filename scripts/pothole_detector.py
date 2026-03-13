import requests
import time
import random

# Configuration
API_URL = "http://localhost:5000/api/potholes/detect"

# Mock GPS bounds for a city (e.g., New Delhi roughly)
LAT_MIN, LAT_MAX = 28.50, 28.70
LON_MIN, LON_MAX = 77.10, 77.30

# Mock sample images that a YOLO model would capture
SAMPLE_IMAGES = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Pothole.jpg/800px-Pothole.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Large_pothole_on_residential_street.jpg/640px-Large_pothole_on_residential_street.jpg",
    "https://miro.medium.com/v2/resize:fit:1200/1*C6xRk0_3Z_Rk7V_zC2XlJQ.jpeg",
    "" # Sometimes no image is saved
]

def generate_mock_detection():
    # Simulate a YOLOv8 detection output
    severity_levels = ["low", "medium", "high"]
    
    # 70% chance of high confidence, 30% chance of lower confidence
    confidence = random.uniform(0.75, 0.99) if random.random() > 0.3 else random.uniform(0.40, 0.74)
    
    payload = {
        "latitude": round(random.uniform(LAT_MIN, LAT_MAX), 6),
        "longitude": round(random.uniform(LON_MIN, LON_MAX), 6),
        "severityLevel": random.choices(severity_levels, weights=[40, 40, 20])[0], # Less high severity naturally
        "confidence": round(confidence, 2),
        "imageUrl": random.choice(SAMPLE_IMAGES)
    }
    return payload

def send_detection(payload):
    try:
        print(f"Detecting pothole... [{payload['severityLevel'].upper()}] Confidence: {payload['confidence']}")
        response = requests.post(API_URL, json=payload, headers={"Content-Type": "application/json"})
        
        if response.status_code == 201:
            print(f"✅ Successfully reported pothole at ({payload['latitude']}, {payload['longitude']})")
        else:
            print(f"❌ Failed to report. Status Code: {response.status_code}, Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"🛑 Connection error: Is the backend server running at {API_URL}?")
        print(f"Error details: {e}")

if __name__ == "__main__":
    print("-" * 50)
    print("🚗 YOLOv8 Mock Pothole Detection System Started")
    print(f"📡 Target API: {API_URL}")
    print("Press Ctrl+C to stop.")
    print("-" * 50)
    
    try:
        # Run 5 initial detections quickly to populate the dashboard
        print("Running initial batch of 5 mock detections...")
        for _ in range(5):
            detection = generate_mock_detection()
            send_detection(detection)
            time.sleep(1)
            
        print("\nSwitching to continuous mode (1 detection every 10-30 seconds)...")
        while True:
            # Sleep a random amount to simulate driving
            sleep_time = random.uniform(10, 30)
            print(f"Driving... next detection check in {round(sleep_time)} seconds.")
            time.sleep(sleep_time)
            
            # 50% chance to detect a pothole during this interval
            if random.random() > 0.5:
                detection = generate_mock_detection()
                send_detection(detection)
            else:
                print("No potholes detected in this sector. Road is clear.")

    except KeyboardInterrupt:
        print("\n🛑 Detection system stopped gracefully.")
