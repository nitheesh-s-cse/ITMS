# 🚆 RAILGUARD ITMS — v2.0 Command Center

> **Real-Time Railway Track Monitoring & Intelligent Safety System**  
> Built by **NEXUS** | MSME Idea Hackathon 6.0 | Theme: Robotics & Automation

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   RAILGUARD ITMS Frontend                    │
│            React + Vite + Tailwind CSS + Chart.js           │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket (Socket.IO)
                         │ MJPEG Stream (/video_feed)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Flask Backend (localhost:5000)                  │
│    YOLOv8 Inference · Socket.IO · OpenCV MJPEG Stream       │
└────────────────────────┬────────────────────────────────────┘
                         │ USB / IP Camera
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           NVIDIA Jetson Orin (Edge AI Node)                 │
│  77GHz Radar · PTZ Thermal Camera · Laser · IMU/GNSS        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- (Optional) Python 3.10+ with Flask for backend

### Frontend Only (Demo Mode)
```bash
git clone <repo-url>
cd railguard-itms
npm install
npm run dev
```
Open http://localhost:5173 — all sections load with realistic static/simulated data.

---

## 🔌 Backend Integration (Flask + Flask-SocketIO)

### Minimal Flask backend (`backend/app.py`):

```python
from flask import Flask, Response
from flask_socketio import SocketIO, emit
import cv2, threading, time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

camera = cv2.VideoCapture(0)  # or RTSP URL

def gen_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        _, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n'
               + buffer.tobytes() + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@socketio.on('connect')
def on_connect():
    emit('camera_status', {'online': True})

def send_heartbeat():
    while True:
        socketio.emit('heartbeat', {'ts': time.time()})
        time.sleep(5)

# Start heartbeat thread
threading.Thread(target=send_heartbeat, daemon=True).start()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
```

### Install backend dependencies:
```bash
pip install flask flask-socketio flask-cors opencv-python ultralytics
```

### YOLOv8 detection integration:
```python
from ultralytics import YOLO
model = YOLO('yolov8n.pt')  # or your custom-trained model

# In your frame processing loop:
results = model(frame, conf=0.5)
for r in results:
    for box in r.boxes:
        cls = model.names[int(box.cls)]
        conf = float(box.conf)
        socketio.emit('detection_event', {
            'class': cls,
            'confidence': round(conf * 100),
            'km': '67.3'  # from GPS
        })
        if conf > 0.85:
            socketio.emit('new_alert', {
                'class': cls,
                'confidence': round(conf * 100),
                'type': 'Obstacle',
                'km': '67.3'
            })
```

---

## 📡 Socket.IO Events Reference

| Event | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| `new_alert` | Server → Client | `{class, confidence, type, km}` | Show alert banner, beep, update alerts table |
| `stats_update` | Server → Client | `{trackScanned, activeAlerts, uptime, accuracy}` | Update KPI cards |
| `heartbeat` | Server → Client | `{ts}` | Keep system-online indicator green |
| `camera_status` | Server → Client | `{online: bool}` | Camera connection state |
| `detection_event` | Server → Client | `{class, confidence, km}` | Update live detection feed |

---

## 📹 Mobile IP Webcam (for testing)

1. Install **IP Webcam** app (Android) or **EpocCam** (iOS)
2. Start server on your phone (e.g., `http://10.213.209.213:8080`)
3. The frontend points to `http://10.213.209.213:8080/video` by default
4. Change IP in Settings → Camera Configuration → Save

---

## 🌐 Deployment Guide

### Option 1: GitHub + Vercel (Recommended — Free)

```bash
# 1. Build the project
npm run build

# 2. Initialize git repo
git init
git add .
git commit -m "RAILGUARD ITMS v2.0"

# 3. Push to GitHub
git remote add origin https://github.com/<your-username>/railguard-itms.git
git push -u origin main

# 4. Deploy to Vercel
# - Go to https://vercel.com
# - Import your GitHub repo
# - Framework Preset: Vite
# - Build command: npm run build
# - Output directory: dist
# - Click Deploy
```

> **Live URL:** `https://railguard-itms.vercel.app`

---

### Option 2: GitHub + Netlify (Free)

```bash
# After building locally:
npm run build

# Option A: Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist

# Option B: Netlify UI
# 1. Go to https://app.netlify.com
# 2. "Add new site" → "Import from Git"
# 3. Build command: npm run build
# 4. Publish directory: dist
# 5. Deploy
```

Add a `netlify.toml` at root for proper SPA routing:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: GitHub Pages (Free, Static)

```bash
npm install -D gh-pages
```

Add to `package.json`:
```json
"homepage": "https://<username>.github.io/railguard-itms",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

```bash
npm run deploy
```

---

### Option 4: Render (Free tier — with backend)

For **full-stack** (frontend + Flask backend) deployment:

```bash
# Frontend: Render Static Site
# - Connect GitHub repo
# - Build command: npm run build
# - Publish directory: dist

# Backend: Render Web Service (Python)
# - Connect same or separate repo
# - Start command: gunicorn app:app
# - Environment: Python 3.10
```

Add `render.yaml`:
```yaml
services:
  - type: web
    name: railguard-frontend
    env: static
    buildCommand: npm run build
    staticPublishPath: dist
    
  - type: web
    name: railguard-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn --worker-class eventlet -w 1 app:app
    envVars:
      - key: PORT
        value: 5000
```

---

## 📁 Project File Structure

```
/
├── index.html                    # App entry point (with Google Fonts CDN)
├── package.json                  # Dependencies
├── vite.config.ts                # Vite config (singlefile plugin)
├── tsconfig.json                 # TypeScript config
├── README.md                     # This file
└── src/
    ├── main.tsx                  # React root mount
    ├── App.tsx                   # Main app, section routing, Socket.IO client
    ├── index.css                 # Global design system CSS
    ├── data/
    │   └── mockData.ts           # All static/simulated data
    ├── hooks/
    │   ├── useCountUp.ts         # Animated number counter + useInterval
    │   └── useToast.tsx          # Toast notification system (Context)
    ├── components/
    │   ├── Sidebar.tsx           # Collapsible nav sidebar
    │   └── Topbar.tsx            # Live clock, alerts bell, avatar
    └── sections/
        ├── Dashboard.tsx         # KPIs, camera preview, chart, sensor strip
        ├── LiveMonitoring.tsx    # Full MJPEG stream, detection feed, TTR
        ├── SensorStatus.tsx      # 4-sensor grid with sparklines & diagnostics
        ├── AIDetection.tsx       # YOLOv8 stats, classes, histogram, log
        ├── Alerts.tsx            # Alert table, severity pie, state machine
        ├── TrackHealth.tsx       # SVG route map, segment health, trend chart
        ├── Analytics.tsx         # Multi-chart analytics, response time
        ├── Maintenance.tsx       # Upcoming work orders, history, health bars
        ├── Reports.tsx           # Report generator, preview panel
        ├── Business.tsx          # B2G model, competitive matrix, impact tiles
        ├── Roadmap.tsx           # 3-phase timeline, national DB cards
        └── Settings.tsx          # Camera, alerts, sensitivity, system info
```

---

## 🔧 Environment Variables (Optional)

Create `.env.local` for custom endpoints:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_CAMERA_URL=http://10.213.209.213:8080
```

Then in code:
```ts
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
```

---

## 🛡️ CORS Configuration (Flask)

```python
from flask_cors import CORS
CORS(app, resources={r"/*": {"origins": "*"}})
# Or for production:
CORS(app, resources={r"/*": {"origins": ["https://railguard-itms.vercel.app"]}})
```

---

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite 7 + vite-plugin-singlefile |
| Styling | Tailwind CSS 4 + Custom CSS |
| Charts | Chart.js 4 + react-chartjs-2 |
| Icons | Lucide React (via CDN) |
| Real-time | Socket.IO client 4.7 |
| Fonts | Space Grotesk · Inter · JetBrains Mono · Poppins |
| Backend (optional) | Flask + Flask-SocketIO + OpenCV |
| Edge AI (hardware) | NVIDIA Jetson Orin + YOLOv8 + TensorRT |

---

## 🏆 Hackathon Context

**Event:** MSME Idea Hackathon 6.0  
**Theme:** Robotics and Automation  
**Team:** NEXUS  
**Product:** RAILGUARD ITMS — Real-Time Railway Track Monitoring  

---

*RAILGUARD ITMS — Built by NEXUS*
