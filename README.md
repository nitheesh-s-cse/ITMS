# 🚆 RAILGUARD ITMS — Command Center Dashboard

Real-time railway track monitoring prototype: phone IP-camera → YOLOv8
object detection → live warnings on an industrial command-center dashboard.

**Team NEXUS** · MSME Idea Hackathon 6.0 · Theme: Robotics and Automation

---

## How it works

```
📱 Mobile IP Webcam  →  🐍 Render (Flask + YOLOv8 + Socket.IO)  →  🗄️ Supabase (alert log)
                                        ↓
                          🖥️ Vercel (dashboard frontend, live via WebSocket)
```

- Your phone streams video (via the **IP Webcam** Android app)
- The Python backend pulls that stream, runs YOLOv8 on every frame, and
  fires an alert when a person/animal/vehicle is detected in the track's
  danger zone
- Alerts are pushed instantly to the dashboard over Socket.IO, and logged
  to Supabase for history

---

## 1. Set up your phone camera

1. Install **"IP Webcam"** (by Pavel Khlebovich) from Play Store
2. Open it, scroll down, tap **Start server**
3. Note the URL shown, e.g. `http://10.213.209.213:8080` — the video
   stream is at `http://<that-ip>:8080/video`
4. Keep your phone and the machine running the backend **on the same
   Wi-Fi network** if testing locally. For a fully public deploy (Render
   backend reaching your home phone) you'll need the phone reachable from
   the internet — see the "Going fully public" note at the bottom.

---

## 2. Deploy the backend on Render (free tier)

1. Push the `backend/` folder to a GitHub repo (or the whole project —
   Render will just point at the `backend` subfolder)
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo, set:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`
   - **Instance Type:** Free
4. Add environment variables (Render dashboard → Environment):
   ```
   IP_CAM_URL=http://<your-phone-ip>:8080/video
   CONFIDENCE_THRESHOLD=0.5
   ALERT_COOLDOWN_SECONDS=5
   SUPABASE_URL=<from step 3 below>
   SUPABASE_KEY=<from step 3 below>
   ```
5. Deploy. Once live, your backend URL will look like:
   `https://railguard-backend.onrender.com`

> **Note:** Render's free tier spins down after inactivity — the first
> request after idle will take ~30–50s to wake up. Fine for a hackathon
> demo; mention it to judges if they hit a slow first load.

---

## 3. Set up Supabase (free Postgres database)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Once created, open the **SQL Editor** and run the contents of
   `backend/supabase_schema.sql` (creates the `alerts` table)
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** (or service role key for full write access) →
     `SUPABASE_KEY`
4. Paste both into your Render environment variables (step 2.4 above)

---

## 4. Deploy the frontend on Vercel (free)

1. Push the `frontend/` folder to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo
3. **Root Directory:** `frontend`
4. Framework preset: **Other** (it's plain static HTML/CSS/JS, no build step)
5. Before deploying, open `frontend/index.html` and update this line near
   the bottom to your live Render backend URL:
   ```html
   <script>
     window.RAILGUARD_BACKEND_URL = "https://railguard-backend.onrender.com";
   </script>
   ```
6. Deploy. Vercel gives you a live URL like
   `https://railguard-itms.vercel.app` — that's your demo link.

---

## 5. Local testing (before deploying)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit IP_CAM_URL, Supabase keys
python app.py
```
Backend runs at `http://localhost:5000`.

**Frontend:**
```bash
cd frontend
python -m http.server 8000
```
Open `http://localhost:8000` — `window.RAILGUARD_BACKEND_URL` already
defaults to `http://localhost:5000`, so it works out of the box locally.

---

## Going fully public (phone reachable from Render's cloud servers)

Render's servers can't reach a phone sitting on your home Wi-Fi behind
NAT. Two options for a fully live public demo:

- **Easiest for a hackathon demo:** run the backend locally (on a laptop
  on the same Wi-Fi as the phone) instead of Render, and use a tunnel
  tool like `ngrok` to expose `localhost:5000` publicly. Point
  `window.RAILGUARD_BACKEND_URL` at the ngrok URL. Judges can then open
  your Vercel frontend and see the real live feed.
- **For a real deployment later:** use a phone with a public/static IP,
  a port-forwarded router, or swap the phone for a proper IP camera with
  cloud relay (e.g. RTSP → a small relay service) so Render can reach it
  directly.

---

## Project structure

```
railguard/
├── backend/
│   ├── app.py                  # Flask + SocketIO + YOLOv8 detection
│   ├── requirements.txt
│   ├── render.yaml
│   ├── .env.example
│   └── supabase_schema.sql
└── frontend/
    ├── index.html
    ├── vercel.json
    ├── css/style.css
    └── js/
        ├── main.js             # nav, socket client, controls
        ├── charts.js           # all Chart.js visualizations
        └── dashboard.js        # live data rendering + demo data
```

## What's real vs. simulated

| Section | Data source |
|---|---|
| Live Monitoring, Alerts, AI Detection log | **Real** — WebSocket events from YOLOv8 |
| Dashboard KPIs (scanned km, active alerts) | **Real** — from backend stats |
| Sensor Status (Radar/Thermal/Laser/GPS readings) | Simulated (no physical sensors in this prototype — only the camera pipeline is real) |
| Track Health, Analytics history, Maintenance, Reports, Business & Impact, Scalability Roadmap | Simulated/static — structured so real data can be wired in later |

## Team

**NEXUS** — MSME Idea Hackathon 6.0, Robotics and Automation
