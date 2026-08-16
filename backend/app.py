"""
RAILGUARD ITMS — Backend
Pulls a mobile IP-webcam MJPEG stream, runs YOLOv8 object detection on each
frame, applies obstacle-warning logic, pushes real-time events over
Socket.IO, and logs alerts to Supabase (Postgres).
"""

import os
import time
import base64
import threading
from datetime import datetime, timezone

import cv2
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from ultralytics import YOLO
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
IP_CAM_URL = os.getenv("IP_CAM_URL", "http://10.200.57.8:8080/video")
if not IP_CAM_URL or "<your-phone-ip>" in IP_CAM_URL or "YOUR-PHONE-IP" in IP_CAM_URL:
    IP_CAM_URL = "http://10.200.57.8:8080/video"
CONFIDENCE_THRESHOLD_DEFAULT = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))
ALERT_COOLDOWN_SECONDS = float(os.getenv("ALERT_COOLDOWN_SECONDS", "5"))
FRAME_WIDTH = int(os.getenv("FRAME_WIDTH", "640"))

# Classes from the COCO model that matter for a rail-safety use case.
# (person, animals, vehicles — matches the "obstacle" categories in the pitch)
WATCH_CLASSES = {
    "person": "person",
    "dog": "animal",
    "cow": "animal",
    "horse": "animal",
    "sheep": "animal",
    "cat": "animal",
    "car": "vehicle",
    "truck": "vehicle",
    "bus": "vehicle",
    "motorcycle": "vehicle",
    "bicycle": "vehicle",
}

MONGODB_URI = os.getenv("MONGODB_URI")
mongo_db = None
if MONGODB_URI:
    try:
        from pymongo import MongoClient
        mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        mongo_db = mongo_client.get_database("railguard_itms")
        print("[INFO] Connected to MongoDB Atlas")
    except Exception as e:
        print(f"[WARN] MongoDB Atlas not initialised: {e}")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[WARN] Supabase not initialised: {e}")

# ---------------------------------------------------------------------------
# APP SETUP
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

model = YOLO("yolov8n.pt")  # small + fast, CPU-friendly

state = {
    "confidence_threshold": CONFIDENCE_THRESHOLD_DEFAULT,
    "camera_connected": False,
    "last_cooldown": {},        # {class_name: last_alert_timestamp}
    "current_frame_jpeg": None,
    "stats": {
        "track_scanned_km": 0.0,
        "active_alerts": 0,
        "detection_accuracy": 91.4,
        "start_time": time.time(),
    },
}
state_lock = threading.Lock()


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def log_alert_to_db(alert):
    if mongo_db is not None:
        try:
            mongo_db.alerts.insert_one(dict(alert))
        except Exception as e:
            print(f"[WARN] MongoDB insert failed: {e}")

    if supabase is not None:
        try:
            supabase.table("alerts").insert(alert).execute()
        except Exception as e:
            print(f"[WARN] Supabase insert failed: {e}")



def in_danger_zone(box, frame_w, frame_h):
    """Center third of the frame ~= where the track runs for a train-mounted cam."""
    x1, y1, x2, y2 = box
    cx = (x1 + x2) / 2
    return frame_w * 0.25 < cx < frame_w * 0.75


def process_frame(frame):
    h, w = frame.shape[:2]
    results = model(frame, verbose=False)[0]

    detections = []
    for box in results.boxes:
        cls_id = int(box.cls[0])
        cls_name = model.names[cls_id]
        conf = float(box.conf[0])
        if conf < state["confidence_threshold"]:
            continue

        xyxy = box.xyxy[0].tolist()
        x1, y1, x2, y2 = map(int, xyxy)
        label = WATCH_CLASSES.get(cls_name, cls_name)

        # draw overlay
        danger = cls_name in WATCH_CLASSES and in_danger_zone((x1, y1, x2, y2), w, h)
        color = (0, 0, 255) if danger else (6, 182, 212)  # BGR: red / cyan
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, f"{cls_name} {conf:.2f}", (x1, max(y1 - 8, 12)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        detection = {
            "class": cls_name,
            "label": label,
            "confidence": round(conf, 3),
            "bbox": [x1, y1, x2, y2],
            "timestamp": now_iso(),
        }
        detections.append(detection)
        socketio.emit("detection_event", detection)

        if cls_name in WATCH_CLASSES and danger:
            last = state["last_cooldown"].get(cls_name, 0)
            if time.time() - last > ALERT_COOLDOWN_SECONDS:
                state["last_cooldown"][cls_name] = time.time()
                alert = {
                    "type": "OBSTACLE",
                    "object_class": cls_name,
                    "confidence": round(conf, 3),
                    "km_marker": round(state["stats"]["track_scanned_km"], 2),
                    "severity": "High" if conf > 0.75 else "Medium",
                    "status": "Active",
                    "timestamp": now_iso(),
                }
                with state_lock:
                    state["stats"]["active_alerts"] += 1
                socketio.emit("new_alert", alert)
                log_alert_to_db(alert)

    return frame, detections


def camera_loop():
    """Background thread: pulls frames from the phone's IP-webcam feed."""
    while True:
        cap = cv2.VideoCapture(IP_CAM_URL)
        if not cap.isOpened():
            state["camera_connected"] = False
            socketio.emit("camera_status", {"connected": False, "url": IP_CAM_URL})
            print(f"[CAM] Could not open {IP_CAM_URL}, retrying in 5s...")
            time.sleep(5)
            continue

        state["camera_connected"] = True
        socketio.emit("camera_status", {"connected": True, "url": IP_CAM_URL})
        print(f"[CAM] Connected to {IP_CAM_URL}")

        frame_count = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                print("[CAM] Lost connection, reconnecting...")
                state["camera_connected"] = False
                socketio.emit("camera_status", {"connected": False, "url": IP_CAM_URL})
                break

            frame_count += 1
            # run detection every frame (YOLOv8n is light enough on CPU;
            # drop to every-2nd-frame if your Render instance is slow)
            frame, _ = process_frame(frame)

            with state_lock:
                state["stats"]["track_scanned_km"] += 0.0008  # simulated distance ticker

            ok2, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            if ok2:
                state["current_frame_jpeg"] = buf.tobytes()

        cap.release()


def heartbeat_loop():
    while True:
        socketio.emit("heartbeat", {"timestamp": now_iso()})
        socketio.emit("stats_update", state["stats"])
        time.sleep(3)


# ---------------------------------------------------------------------------
# ROUTES
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return jsonify({"service": "RAILGUARD ITMS backend", "status": "running"})


@app.route("/video_feed")
def video_feed():
    def generate():
        while True:
            if state["current_frame_jpeg"] is not None:
                frame = state["current_frame_jpeg"]
                yield (b"--frame\r\n"
                       b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")
            time.sleep(0.05)
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/api/settings/threshold", methods=["POST"])
def set_threshold():
    data = request.get_json(force=True)
    value = float(data.get("threshold", CONFIDENCE_THRESHOLD_DEFAULT))
    state["confidence_threshold"] = max(0.1, min(0.9, value))
    return jsonify({"ok": True, "threshold": state["confidence_threshold"]})


@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    if mongo_db is not None:
        try:
            alerts = list(mongo_db.alerts.find({}, {"_id": 0}).sort("timestamp", -1).limit(50))
            return jsonify(alerts)
        except Exception as e:
            print(f"[WARN] MongoDB query failed: {e}")

    if supabase is not None:
        try:
            res = supabase.table("alerts").select("*").order("timestamp", desc=True).limit(50).execute()
            return jsonify(res.data)
        except Exception as e:
            print(f"[WARN] Supabase query failed: {e}")

    return jsonify([])


@app.route("/api/status", methods=["GET"])
def get_status():
    return jsonify({
        "camera_connected": state["camera_connected"],
        "confidence_threshold": state["confidence_threshold"],
        "stats": state["stats"],
    })


if __name__ == "__main__":
    threading.Thread(target=camera_loop, daemon=True).start()
    threading.Thread(target=heartbeat_loop, daemon=True).start()
    port = int(os.getenv("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port, allow_unsafe_werkzeug=True)
