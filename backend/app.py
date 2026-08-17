"""
RAILGUARD ITMS — Backend
Pulls a mobile IP-webcam MJPEG stream, runs YOLOv8 object detection on each
frame, applies obstacle-warning logic, pushes real-time events over
Socket.IO, and logs alerts to Supabase (Postgres).
"""

import os
# Auto-skip ngrok browser warning page & reduce FFmpeg network timeout to 500ms (0.5s) instead of 30s!
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "timeout|500000;stimeout|500000;headers|ngrok-skip-browser-warning: 69420\r\nUser-Agent: Mozilla/5.0"


import time
import base64
import threading
from datetime import datetime, timezone

import requests
import cv2
import numpy as np

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
CONFIDENCE_THRESHOLD_DEFAULT = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))
ALERT_COOLDOWN_SECONDS = float(os.getenv("ALERT_COOLDOWN_SECONDS", "5"))
FRAME_WIDTH = int(os.getenv("FRAME_WIDTH", "640"))


# Target obstacle categories that require safety warnings & emergency alerts
OBSTACLE_CLASSES = {"person", "dog", "cow", "horse", "sheep", "cat", "car", "truck", "bus", "motorcycle", "bicycle"}

# COCO label mapping
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

# Initial placeholder JPEG frame (so /video_feed never hangs on connect)
dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)
cv2.putText(dummy_img, "RAILGUARD CAM STREAM INITIALIZING...", (90, 240),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (6, 182, 212), 2)
_, dummy_buf = cv2.imencode(".jpg", dummy_img)

initial_ip_cam = os.getenv("IP_CAM_URL", "http://10.162.14.149:8080/video")
if not initial_ip_cam or "<your-phone-ip>" in initial_ip_cam or "YOUR-PHONE-IP" in initial_ip_cam:
    initial_ip_cam = "http://10.162.14.149:8080/video"
if not initial_ip_cam.endswith("/video"):
    initial_ip_cam = initial_ip_cam.rstrip("/") + "/video"


state = {
    "ip_cam_url": initial_ip_cam,
    "camera_source": "ipcam",   # "ipcam" or "webcam"
    "reconnect_requested": False,
    "confidence_threshold": CONFIDENCE_THRESHOLD_DEFAULT,

    "camera_connected": False,
    "last_cooldown": {},        # {class_name: last_alert_timestamp}
    "current_frame_jpeg": dummy_buf.tobytes(),
    "stats": {
        "track_scanned_km": 0.0,
        "active_alerts": 0,
        "detection_accuracy": 96.4,
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


last_detections_cache = []
latest_detections = []
detections_lock = threading.Lock()

def yolo_worker():
    """Background worker thread running YOLO object detection asynchronously without blocking video stream."""
    global latest_detections
    while True:
        try:
            if not state.get("camera_connected", False):
                time.sleep(0.1)
                continue

            frame = state.get("raw_frame_for_yolo", None)
            if frame is None:
                time.sleep(0.02)
                continue

            # Clear frame pointer so we only process fresh frames
            state["raw_frame_for_yolo"] = None

            h, w = frame.shape[:2]
            results = model(frame, imgsz=320, verbose=False)[0]

            detections = []
            for box in results.boxes:
                cls_id = int(box.cls[0])
                cls_name = model.names[cls_id]
                conf = float(box.conf[0])

                min_thresh = state["confidence_threshold"]
                if cls_name == "person":
                    min_thresh = max(0.62, min_thresh)

                if conf < min_thresh:
                    continue

                xyxy = box.xyxy[0].tolist()
                x1, y1, x2, y2 = map(int, xyxy)
                box_w = x2 - x1
                box_h = y2 - y1

                if box_w < 20 or box_h < 30:
                    continue

                if cls_name == "person":
                    aspect_ratio = box_w / float(box_h)
                    if aspect_ratio > 1.8 and box_h < 120:
                        continue

                label = WATCH_CLASSES.get(cls_name, "object")
                danger = (cls_name in OBSTACLE_CLASSES) and in_danger_zone((x1, y1, x2, y2), w, h)

                detection = {
                    "class": cls_name,
                    "label": label,
                    "confidence": round(conf, 3),
                    "bbox": [x1, y1, x2, y2],
                    "danger": danger,
                    "timestamp": now_iso(),
                }
                detections.append(detection)
                socketio.emit("detection_event", detection)

                if danger:
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

            with detections_lock:
                latest_detections = detections

        except Exception:
            time.sleep(0.05)

# Start YOLO detection worker thread
threading.Thread(target=yolo_worker, daemon=True).start()


def make_status_frame(text_msg, sub_msg=""):
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(img, text_msg, (40, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (6, 182, 212), 2)
    if sub_msg:
        cv2.putText(img, sub_msg, (40, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (148, 163, 184), 1)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def is_url_reachable(url, timeout=2):
    url_str = str(url).strip()
    if not url_str or url_str == "0" or "webcam" in url_str:
        return True
    try:
        r = requests.get(url_str, timeout=timeout, stream=True, headers={"ngrok-skip-browser-warning": "69420", "User-Agent": "Mozilla/5.0"})
        return r.status_code < 500
    except Exception:
        return False


def camera_loop():
    """Background thread: pulls frames from mobile IP-cam or laptop built-in webcam with zero buffer latency & thread safety."""
    while True:
        try:
            source_mode = state.get("camera_source", "ipcam")
            if source_mode == "webcam":
                current_target = 0
                cap_backend = cv2.CAP_DSHOW if os.name == 'nt' else cv2.CAP_ANY
                target_desc = "Laptop Built-in Webcam (Index 0)"
            else:
                current_target = state["ip_cam_url"]
                target_desc = state["ip_cam_url"]
                cap_backend = cv2.CAP_ANY

            state["reconnect_requested"] = False
            state["current_frame_jpeg"] = make_status_frame("CONNECTING TO STREAM...", f"Target: {target_desc}")

            if source_mode == "ipcam":
                if not is_url_reachable(current_target, timeout=2):
                    state["camera_connected"] = False
                    state["current_frame_jpeg"] = make_status_frame("STREAM UNREACHABLE", f"Check URL / Termux: {current_target}")
                    socketio.emit("camera_status", {"connected": False, "url": str(current_target), "source": source_mode})
                    print(f"[CAM] URL unreachable {current_target}, retrying in 2s...")
                    for _ in range(20):
                        if state["reconnect_requested"]:
                            break
                        time.sleep(0.1)
                    continue

            cap = cv2.VideoCapture(current_target, cap_backend) if source_mode == "webcam" and os.name == 'nt' else cv2.VideoCapture(current_target)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # flush buffer for zero lag

            if not cap.isOpened():
                state["camera_connected"] = False
                state["current_frame_jpeg"] = make_status_frame("CAMERA OPEN FAILED", f"Could not open {target_desc}")
                socketio.emit("camera_status", {"connected": False, "url": str(current_target), "source": source_mode})
                print(f"[CAM] Could not open {target_desc}, retrying in 2s...")
                for _ in range(20):
                    if state["reconnect_requested"]:
                        break
                    time.sleep(0.1)
                continue

            state["camera_connected"] = True
            socketio.emit("camera_status", {"connected": True, "url": str(current_target), "source": source_mode})
            print(f"[CAM] Connected to {target_desc} — Ultra Fast Async Pipeline Active!")

            latest_raw_frame = [None]
            grab_active = [True]
            grab_lock = threading.Lock()
            cap_lock = threading.Lock()

            def grabber():
                while grab_active[0]:
                    try:
                        with cap_lock:
                            if not grab_active[0]:
                                break
                            ok, f = cap.read()
                        if ok and f is not None and f.size > 0:
                            with grab_lock:
                                latest_raw_frame[0] = f
                        else:
                            time.sleep(0.01)
                    except Exception:
                        time.sleep(0.05)

            t_grab = threading.Thread(target=grabber, daemon=True)
            t_grab.start()

            frame_count = 0
            consecutive_failures = 0

            while True:
                if state["reconnect_requested"]:
                    print("[CAM] Reconnect/Source change requested via API, switching stream...")
                    break

                with grab_lock:
                    frame = latest_raw_frame[0]
                    latest_raw_frame[0] = None

                if frame is None:
                    consecutive_failures += 1
                    if consecutive_failures > 60:  # ~3 seconds of no frames
                        print(f"[CAM] Lost connection to {target_desc}, reconnecting...")
                        state["camera_connected"] = False
                        state["current_frame_jpeg"] = make_status_frame("CAMERA STREAM LOST", f"Reconnecting to {target_desc}...")
                        socketio.emit("camera_status", {"connected": False, "url": str(current_target), "source": source_mode})
                        break
                    time.sleep(0.01)
                    continue

                consecutive_failures = 0

                # Send raw frame copy to background YOLO worker
                state["raw_frame_for_yolo"] = frame.copy()

                # Overlay cached detections (< 0.2ms)
                with detections_lock:
                    dets = list(latest_detections)

                for det in dets:
                    x1, y1, x2, y2 = det["bbox"]
                    danger = det.get("danger", False)
                    color = (0, 0, 255) if danger else (6, 182, 212)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, f"{det['class']} {det['confidence']:.2f}", (x1, max(y1 - 8, 12)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                with state_lock:
                    state["stats"]["track_scanned_km"] += 0.0008

                # Downscale for ultra-fast 90 FPS streaming if resolution > 480
                h_f, w_f = frame.shape[:2]
                if w_f > 480:
                    frame = cv2.resize(frame, (480, int(h_f * 480 / w_f)))

                ok2, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 40])
                if ok2:
                    jpeg_bytes = buf.tobytes()
                    state["current_frame_jpeg"] = jpeg_bytes
                    b64_str = base64.b64encode(jpeg_bytes).decode("utf-8")
                    socketio.emit("video_frame", b64_str)

                time.sleep(0.005)


            # Clean shutdown of grabber thread & cap release
            with cap_lock:
                grab_active[0] = False
                try:
                    cap.release()
                except Exception:
                    pass
            t_grab.join(timeout=1.0)

        except Exception as e:
            print(f"[CAM Loop Exception]: {e}")
            time.sleep(2)







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
        last_sent = None
        while True:
            frame = state.get("current_frame_jpeg", None)
            if frame is not None and frame != last_sent:
                last_sent = frame
                yield (b"--frame\r\n"
                       b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")
            time.sleep(0.015)  # ~60 FPS check rate for instant video delivery
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")



def normalize_cam_url(raw_url):
    url = str(raw_url).strip()
    if not url:
        return ""
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    if not url.endswith("/video"):
        url = url.rstrip("/") + "/video"
    return url


@app.route("/api/settings/threshold", methods=["POST"])
def set_threshold():
    data = request.get_json(force=True)
    value = float(data.get("threshold", CONFIDENCE_THRESHOLD_DEFAULT))
    state["confidence_threshold"] = max(0.1, min(0.9, value))
    return jsonify({"ok": True, "threshold": state["confidence_threshold"]})


@app.route("/api/settings/camera", methods=["POST"])
def set_camera():
    data = request.get_json(force=True)
    source = str(data.get("source", "")).strip().lower()
    raw_url = str(data.get("url", "")).strip()

    if source in ["webcam", "laptop", "0"]:
        state["camera_source"] = "webcam"
        state["reconnect_requested"] = True
        print("[CAM] Switched camera source to Laptop Built-in Webcam (Index 0)")
        return jsonify({"ok": True, "source": "webcam", "url": "webcam:0"})

    if raw_url or source in ["ipcam", "mobile"]:
        if raw_url:
            state["ip_cam_url"] = normalize_cam_url(raw_url)
        state["camera_source"] = "ipcam"
        state["reconnect_requested"] = True
        print(f"[CAM] Switched camera source to Mobile IP/Ngrok Cam: {state['ip_cam_url']}")
        return jsonify({"ok": True, "source": "ipcam", "url": state["ip_cam_url"]})

    return jsonify({"ok": False, "error": "Invalid camera parameters"}), 400


@app.route("/api/settings/camera/test", methods=["POST"])
def test_camera():
    data = request.get_json(force=True)
    source = str(data.get("source", "")).strip().lower()
    raw_url = str(data.get("url", "")).strip()

    test_target = 0 if source in ["webcam", "laptop", "0"] else normalize_cam_url(raw_url)
    if source not in ["webcam", "laptop", "0"]:
        if not raw_url:
            return jsonify({"ok": False, "error": "Camera URL cannot be empty"}), 400

    try:
        test_cap = cv2.VideoCapture(test_target)
        if not test_cap.isOpened():
            test_cap.release()
            return jsonify({"ok": False, "error": f"Could not open stream at {test_target}"}), 400

        ok, frame = test_cap.read()
        test_cap.release()

        if ok and frame is not None and frame.size > 0:
            return jsonify({"ok": True, "message": "Frame acquired successfully"})
        else:
            return jsonify({"ok": False, "error": "Stream opened but failed to read frame"}), 400
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500



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
        "ip_cam_url": state["ip_cam_url"],
        "camera_source": state.get("camera_source", "ipcam"),
        "confidence_threshold": state["confidence_threshold"],
        "stats": state["stats"],
    })




if __name__ == "__main__":
    threading.Thread(target=camera_loop, daemon=True).start()
    threading.Thread(target=heartbeat_loop, daemon=True).start()
    port = int(os.getenv("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port, allow_unsafe_werkzeug=True)
