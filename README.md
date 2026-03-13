<<<<<<< HEAD
# Smart Pothole Detection & Monitoring System

A comprehensive MERN stack application designed for municipal corporations to automatically detect, monitor, and manage road damages using YOLOv8 computer vision integration.

## Project Architecture

The project consists of three independent components:

1. **Frontend (`/client`)**: React + Vite application with Tailwind CSS and Leaflet for interactive monitoring.
2. **Backend (`/server`)**: Node.js + Express RESTful API with MongoDB for data storage and JWT for secure authentication.
3. **Detection Script (`/scripts`)**: Python script simulating a YOLOv8 object detection model that automatically captures GPS data and reports potholes to the backend API.

## Folder Structure

```
pothole-monitoring-system/
├── client/          # React Frontend (Vite, Tailwind, Leaflet)
├── server/          # Node.js Backend (Express, MongoDB)
├── scripts/         # Python Detectors (Mock YOLOv8 script)
├── docs/            # Additional documentation references
└── README.md
```

## Features

- **Automated Reporting**: Python script simulates YOLOv8 computer vision detections taking pictures and estimating severity.
- **Interactive Map**: Live Leaflet (OpenStreetMap) integration presenting markers color-coded by severity (Red: High, Orange: Medium, Green: Low).
- **Analytics Dashboard**: Tracks total, critical, pending, and fixed potholes.
- **Role-Based Access**: Secure JWT authentication for Field Officers and Administrators.
- **Real-Time Data Table**: Detailed view of detection coordinates, confidence scores, time, and resolution status.

## Environment Setup

### 1. Backend (`/server`)

Create a `.env` file in the `/server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pothole_detection
JWT_SECRET=supersecretjwtkey_replace_in_prod
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Frontend (`/client`)

Create a `.env` file in the `/client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Start Database

Ensure MongoDB is running locally on port 27017, or replace `MONGO_URI` with a MongoDB Atlas connection string.

### Start Backend Server

```bash
cd server
npm install
npm run dev # or node server.js
```

The server will start at `http://localhost:5000`.

### Start Frontend Client

```bash
cd client
npm install
npm run dev
```

The client will start at `http://localhost:5173`.

### Run Python Detetion Script

In a new terminal:

```bash
cd scripts
python pothole_detector.py
```

> **Requirement**: Ensure `requests` is installed for Python (`pip install requests`).

## YOLO Script Communication

The `pothole_detector.py` sends a `POST` request to `/api/potholes/detect`.
The required JSON payload structure is:

```json
{
  "latitude": 28.6139,
  "longitude": 77.209,
  "severityLevel": "high",
  "confidence": 0.88,
  "imageUrl": "https://example.com/pothole.jpg"
}
```

## Future Enhancements

- Email alerts for High severity detections.
- Heatmap visualization of heavily damaged roads.
- Advanced ML severity predictions.
=======
# RoadVision1
>>>>>>> bc98ee46d66b62dfc3741c0476dfc9c46b2fb694
