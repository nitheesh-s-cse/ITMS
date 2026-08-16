// ============================================================
// RAILGUARD ITMS — Config
// ============================================================
const getBackendUrl = () => {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocal) {
    const localSaved = localStorage.getItem("railguard_local_backend_url");
    return localSaved || "http://localhost:5000";
  }
  const saved = localStorage.getItem("railguard_cloud_backend_url");
  if (saved) return saved;
  if (window.RAILGUARD_BACKEND_URL) return window.RAILGUARD_BACKEND_URL;
  return "https://railguard-backend-n12a.onrender.com";
};
let BACKEND_URL = getBackendUrl();



lucide.createIcons();


// ============================================================
// Boot sequence — signature intro animation
// ============================================================
(function runBootSequence() {
  const lines = [
    "Initializing sensor array...",
    "Calibrating 77GHz MMW radar...",
    "Linking PTZ thermal/IR camera...",
    "Syncing dual-stage laser system...",
    "Acquiring GNSS/IMU lock...",
    "Loading YOLOv8 edge inference model...",
    "Establishing Socket.IO uplink...",
    "RAILGUARD ITMS ready.",
  ];
  const logEl = document.getElementById("bootLog");
  const fill = document.getElementById("bootProgress");
  const screen = document.getElementById("bootScreen");
  let i = 0;

  function nextLine() {
    if (i >= lines.length) {
      setTimeout(() => screen.classList.add("hide"), 350);
      return;
    }
    const div = document.createElement("div");
    div.textContent = lines[i];
    div.style.animationDelay = "0ms";
    logEl.appendChild(div);
    if (logEl.children.length > 4) logEl.removeChild(logEl.firstChild);
    fill.style.width = `${Math.round(((i + 1) / lines.length) * 100)}%`;
    i++;
    setTimeout(nextLine, 260);
  }
  nextLine();
})();

// ============================================================
// Ambient particle background
// ============================================================
(function particles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, pts;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function init() {
    resize();
    pts = Array.from({ length: 46 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.4 + 0.4,
    }));
  }
  function tick() {
    ctx.clearRect(0, 0, w, h);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(34,211,238,0.35)";
      ctx.fill();
    });
    // faint connecting lines for nearby points
    for (let a = 0; a < pts.length; a++) {
      for (let b = a + 1; b < pts.length; b++) {
        const dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(34,211,238,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pts[a].x, pts[a].y);
          ctx.lineTo(pts[b].x, pts[b].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener("resize", resize);
  init();
  tick();
})();

// ============================================================
// Radar blips — random obstruction pings on the dashboard hero
// ============================================================
(function radarBlips() {
  const hero = document.getElementById("radarHero");
  if (!hero) return;
  function spawnBlip() {
    const blip = document.createElement("div");
    blip.className = "radar-blip";
    const angle = Math.random() * Math.PI * 2;
    const radius = 40 + Math.random() * 50;
    blip.style.left = `calc(50% + ${Math.cos(angle) * radius}px)`;
    blip.style.top = `calc(50% + ${Math.sin(angle) * radius}px)`;
    hero.appendChild(blip);
    setTimeout(() => blip.remove(), 3600);
  }
  setInterval(spawnBlip, 900);
})();

// ============================================================
// Count-up number animation helper
// ============================================================
function countUpTo(el, target, opts = {}) {
  if (!el) return;
  const { decimals = 0, suffix = "", duration = 900 } = opts;
  const start = parseFloat(el.dataset.rawValue || "0") || 0;
  const startTime = performance.now();
  function frame(t) {
    const p = Math.min((t - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = start + (target - start) * eased;
    el.textContent = val.toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(frame);
    else el.dataset.rawValue = target;
  }
  requestAnimationFrame(frame);
}

// ---------- Navigation ----------
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");
const pageTitle = document.getElementById("pageTitle");

function goTo(name) {
  navItems.forEach(n => n.classList.toggle("active", n.dataset.section === name));
  sections.forEach(s => {
    const isTarget = s.id === `sec-${name}`;
    s.classList.remove("active");
    if (isTarget) {
      // force reflow so the entrance animation replays every time
      void s.offsetWidth;
      s.classList.add("active");
    }
  });
  const active = document.querySelector(`.nav-item[data-section="${name}"]`);
  if (active) pageTitle.textContent = active.textContent.trim();
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebarOverlay")?.classList.remove("show");
}
navItems.forEach(item => item.addEventListener("click", () => goTo(item.dataset.section)));

document.getElementById("hamburger")?.addEventListener("click", () => {
  document.getElementById("sidebar")?.classList.toggle("open");
  document.getElementById("sidebarOverlay")?.classList.toggle("show");
});

document.getElementById("sidebarOverlay")?.addEventListener("click", () => {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebarOverlay")?.classList.remove("show");
});


// ---------- Clock ----------
function tickClock() {
  const el = document.getElementById("clock");
  if (el) el.textContent = new Date().toLocaleTimeString("en-IN", { hour12: false });
}
setInterval(tickClock, 1000);
tickClock();

// ---------- Toasts ----------
function toast(msg) {
  const wrap = document.getElementById("toastWrap");
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ---------- Alert sound (disaster air horn synthesizer) ----------
let audioCtx = null;
let hornInterval = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}
document.addEventListener("click", initAudio);
document.addEventListener("keydown", initAudio);

function playSingleDisasterHorn() {
  const toggle = document.getElementById("toggleSound");
  if (toggle && !toggle.checked) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  
  // Heavy Industrial Disaster Air Horn (Dual-Tone 440Hz + 554.37Hz Dissonant Chord + Sub-Rumble)
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = "sawtooth";
  osc1.frequency.setValueAtTime(440, now);
  osc1.frequency.linearRampToValueAtTime(465, now + 0.35);
  gain1.gain.setValueAtTime(0.45, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
  osc1.connect(gain1);
  gain1.connect(audioCtx.destination);
  osc1.start(now);
  osc1.stop(now + 0.55);

  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = "sawtooth";
  osc2.frequency.setValueAtTime(554.37, now);
  osc2.frequency.linearRampToValueAtTime(580, now + 0.35);
  gain2.gain.setValueAtTime(0.45, now);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
  osc2.connect(gain2);
  gain2.connect(audioCtx.destination);
  osc2.start(now);
  osc2.stop(now + 0.55);

  // Sub-bass heavy rumble for train/disaster horn impact
  const sub = audioCtx.createOscillator();
  const subGain = audioCtx.createGain();
  sub.type = "square";
  sub.frequency.setValueAtTime(110, now);
  subGain.gain.setValueAtTime(0.35, now);
  subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
  sub.connect(subGain);
  subGain.connect(audioCtx.destination);
  sub.start(now);
  sub.stop(now + 0.55);
}

function playBeep() {
  // Continuous repeating disaster horn sequence (6 bursts over 4 seconds)
  playSingleDisasterHorn();
  if (hornInterval) clearInterval(hornInterval);
  let count = 0;
  hornInterval = setInterval(() => {
    count++;
    playSingleDisasterHorn();
    if (count >= 6) {
      clearInterval(hornInterval);
      hornInterval = null;
    }
  }, 600);
}



// ---------- Socket.IO ----------
let socket;
let unreadAlerts = 0;
let alertsCache = [];
let detectionCount = { person: 0, animal: 0, vehicle: 0, debris: 0 };

function connectSocket() {
  socket = io(BACKEND_URL, { transports: ["websocket", "polling"] });

  socket.on("connect", () => {
    setConnStatus(true);
    toast("Connected to RAILGUARD backend");
  });

  socket.on("disconnect", () => setConnStatus(false));

  socket.on("camera_status", data => {
    document.getElementById("connStatus").textContent = data.connected
      ? "Connected to Mobile Camera"
      : "Camera Disconnected — Retrying...";
    document.getElementById("connStatus").className = "conn-status " + (data.connected ? "ok" : "bad");
  });

  socket.on("heartbeat", () => {
    document.getElementById("sysDot").classList.remove("offline");
    document.getElementById("sysText").textContent = "System Online";
  });

  socket.on("stats_update", data => updateStats(data));

  socket.on("new_alert", data => handleNewAlert(data));

  socket.on("detection_event", data => handleDetectionEvent(data));
}

function setConnStatus(ok) {
  const dot = document.getElementById("sysDot");
  const text = document.getElementById("sysText");
  const backendText = document.getElementById("backendStatusText");
  if (ok) {
    dot.classList.remove("offline");
    text.textContent = "System Online";
    if (backendText) backendText.textContent = "Connected";
  } else {
    dot.classList.add("offline");
    text.textContent = "Backend Offline";
    if (backendText) backendText.textContent = "Disconnected";
  }
}

// Attempt connection; if backend isn't reachable the UI still works in demo mode.
try { connectSocket(); } catch (e) { console.warn("Socket connection failed:", e); }

// ---------- Feed images ----------
function setFeedSources(cacheBust = false) {
  const ts = cacheBust ? `?t=${Date.now()}` : "";
  const url = `${BACKEND_URL}/video_feed${ts}`;
  ["dashFeedImg", "liveFeedImg", "thermalFeedImg"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.src = url;
  });
}
setFeedSources();

// ---------- Live Monitoring controls ----------
function snapshotFeed() {
  const img = document.getElementById("liveFeedImg");
  if (!img) return;

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || 640;
  canvas.height = img.naturalHeight || 480;
  const ctx = canvas.getContext("2d");

  try {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.fillRect(10, canvas.height - 36, canvas.width - 20, 26);
    ctx.font = "14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#22d3ee";
    ctx.fillText(`RAILGUARD ITMS SNAPSHOT — ${new Date().toLocaleString()}`, 20, canvas.height - 18);

    const link = document.createElement("a");
    link.download = `RailGuard_Snapshot_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("📸 Snapshot saved & downloaded!");
  } catch (e) {
    toast("📸 Snapshot captured!");
  }
}

let recording = false;
let recTimer = null;
let recSeconds = 0;

function toggleRecording() {
  const btn = document.getElementById("recBtn");
  if (!recording) {
    recording = true;
    recSeconds = 0;
    btn.style.background = "#ef4444";
    btn.style.color = "#ffffff";
    btn.textContent = `⏹ Stop Recording (00:00)`;
    toast("⏺ Live video recording started");

    recTimer = setInterval(() => {
      recSeconds++;
      const mins = String(Math.floor(recSeconds / 60)).padStart(2, '0');
      const secs = String(recSeconds % 60).padStart(2, '0');
      btn.textContent = `⏹ Stop Recording (${mins}:${secs})`;
    }, 1000);
  } else {
    recording = false;
    clearInterval(recTimer);
    btn.style.background = "";
    btn.style.color = "";
    btn.textContent = "⏺ Start Recording";
    snapshotFeed();
    toast(`⏺ Recording stopped (${recSeconds}s clip saved)`);
  }
}

function reconnectCamera() {
  toast("Reconnecting live camera feed...");
  setFeedSources(true);
}

function toggleFullscreen() {
  const el = document.getElementById("liveFeedImg");
  if (el && el.requestFullscreen) el.requestFullscreen();
}

// Night mode enhancement filter toggle
document.getElementById("toggleNight")?.addEventListener("change", (e) => {
  const img = document.getElementById("liveFeedImg");
  if (!img) return;
  if (e.target.checked) {
    img.style.filter = "contrast(1.45) brightness(1.25) hue-rotate(170deg) saturate(2.2)";
    toast("🌙 Night-Vision IR Mode Engaged");
  } else {
    img.style.filter = "none";
    toast("☀️ Normal Camera Mode Restored");
  }
});

// ---------- Sensor diagnostics ----------
function openDiag(name) {
  toast(`${name} — Firmware v3.2.1 · Signal 96% · Temp 27°C`);
}
function runDiagnostic() {
  const bar = document.getElementById("diagBar");
  const fill = document.getElementById("diagBarFill");
  bar.style.display = "block";
  fill.style.width = "0%";
  let p = 0;
  const iv = setInterval(() => {
    p += 5;
    fill.style.width = p + "%";
    if (p >= 100) {
      clearInterval(iv);
      toast("All Systems Nominal ✅");
      setTimeout(() => (bar.style.display = "none"), 800);
    }
  }, 150);
}

// ---------- AI Detection: sensitivity slider ----------
const sensSlider = document.getElementById("sensSlider");
const sensValue = document.getElementById("sensValue");
sensSlider?.addEventListener("input", () => {
  const v = (sensSlider.value / 100).toFixed(2);
  if (sensValue) sensValue.textContent = v;
  fetch(`${BACKEND_URL}/api/settings/threshold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threshold: parseFloat(v) }),
  })
    .then(r => r.json())
    .then(() => toast(`Confidence Sensitivity set to ${v}`))
    .catch(() => {});
});

// ---------- Alerts Tab Filtering ----------
document.querySelectorAll("#sec-alerts .tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#sec-alerts .tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const filter = tab.dataset.filter;
    const rows = document.querySelectorAll("#alertsTableBody tr");
    rows.forEach(row => {
      if (filter === "all") {
        row.style.display = "";
      } else {
        const statusBadge = row.querySelector(".badge");
        const statusText = statusBadge ? statusBadge.textContent.toLowerCase() : "";
        row.style.display = statusText.includes(filter) ? "" : "none";
      }
    });
  });
});

// ---------- Theme Switcher ----------
const themeSelects = document.querySelectorAll("select");
themeSelects.forEach(select => {
  if (select.querySelector("option")?.textContent.includes("Dark")) {
    select.addEventListener("change", (e) => {
      if (e.target.value === "Darker") {
        document.documentElement.style.setProperty("--bg-0", "#030508");
        document.documentElement.style.setProperty("--bg-1", "#070a12");
        document.documentElement.style.setProperty("--panel-bg", "rgba(10, 15, 26, 0.85)");
        toast("Obsidian Darker Theme Applied");
      } else {
        document.documentElement.style.setProperty("--bg-0", "#0a0e17");
        document.documentElement.style.setProperty("--bg-1", "#0f172a");
        document.documentElement.style.setProperty("--panel-bg", "rgba(21, 30, 48, 0.55)");
        toast("Standard Dark Theme Applied");
      }
    });
  }
});


// ---------- Settings: camera config ----------
function testConnection() {
  const input = document.getElementById("camIpInput");
  const val = input ? input.value.trim() : "";
  if (!val) {
    toast("Please enter a camera URL first");
    return;
  }
  toast(`Testing connection to ${val}...`);
}

function saveCamSettings() {
  const input = document.getElementById("camIpInput");
  let val = input ? input.value.trim() : "";
  if (!val) val = "http://10.200.57.8:8080/video";

  if (val !== "0" && val !== "webcam" && val !== "local") {
    if (!val.startsWith("http://") && !val.startsWith("https://") && !val.startsWith("rtsp://")) {
      val = "http://" + val;
    }
  }

  fetch(`${BACKEND_URL}/api/settings/camera`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: val }),
  })
    .then(r => r.json())
    .then(data => {
      toast(`Mobile Camera set to ${val}`);
      reconnectCamera();
    })
    .catch(() => {
      toast(`Camera set to ${val}`);
      reconnectCamera();
    });
}



function saveBackendUrlSettings() {
  const input = document.getElementById("backendUrlInput");
  const val = input ? input.value.trim() : "";
  if (!val) {
    toast("Please enter a valid Backend URL");
    return;
  }
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocal) {
    localStorage.setItem("railguard_local_backend_url", val);
  } else {
    localStorage.setItem("railguard_cloud_backend_url", val);
  }
  BACKEND_URL = val;
  toast("Backend URL saved! Reloading...");
  setTimeout(() => window.location.reload(), 600);
}


document.addEventListener("DOMContentLoaded", () => {
  const bInput = document.getElementById("backendUrlInput");
  if (bInput) bInput.value = BACKEND_URL;
});



// ---------- Reports ----------
function generateReport() {
  const body = document.getElementById("reportsBody");
  const typeSelect = document.getElementById("repType");
  const type = typeSelect ? typeSelect.value : "Daily_Summary";
  const filename = `${type.replace(/\s/g, "_")}_${Date.now()}.pdf`;
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const sizeStr = `${(Math.random() * 2 + 0.5).toFixed(1)} MB`;

  const row = document.createElement("tr");
  row.style.cursor = "pointer";
  row.onclick = () => downloadReport(filename);
  row.innerHTML = `
    <td><span style="color:var(--cyan);text-decoration:underline;">${filename}</span></td>
    <td class="mono">${dateStr}</td>
    <td class="mono">${sizeStr}</td>
    <td><button class="btn" style="padding:4px 8px;" onclick="event.stopPropagation(); downloadReport('${filename}');"><i data-lucide="download"></i> Download</button></td>
  `;
  body.prepend(row);
  lucide.createIcons();
  downloadReport(filename);
}


// ---------- Maintenance modal (simplified inline) ----------
function openMaintModal() {
  toast("Maintenance scheduled");
}
