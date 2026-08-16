// ============================================================
// Live data handlers
// ============================================================

function updateStats(stats) {
  if (stats.track_scanned_km !== undefined) {
    countUpTo(document.getElementById("kpiScanned"), stats.track_scanned_km, { decimals: 2, suffix: " km" });
    document.getElementById("anDistance").textContent = stats.track_scanned_km.toFixed(2) + " km";
  }
  if (stats.active_alerts !== undefined) {
    countUpTo(document.getElementById("kpiAlerts"), stats.active_alerts, { duration: 500 });
  }
  if (stats.detection_accuracy !== undefined) {
    countUpTo(document.getElementById("kpiAccuracy"), stats.detection_accuracy, { decimals: 1, suffix: "%" });
  }
}

function handleNewAlert(alert) {
  unreadAlerts++;
  document.getElementById("bellBadge").textContent = unreadAlerts;
  alertsCache.unshift(alert);
  playBeep();

  // Banner on Live Monitoring
  const banner = document.getElementById("liveAlertBanner");
  banner.textContent = `⚠ OBSTACLE DETECTED: ${alert.object_class} | Confidence: ${(alert.confidence * 100).toFixed(0)}% | Track KM ${alert.km_marker} | ${new Date(alert.timestamp).toLocaleTimeString()}`;
  banner.classList.add("show");
  setTimeout(() => banner.classList.remove("show"), 6000);

  // Flash the dashboard radar hero to "ALERT"
  const radarText = document.getElementById("radarClearText");
  if (radarText) {
    radarText.textContent = "ALERT";
    radarText.style.color = "var(--red)";
    radarText.style.textShadow = "0 0 14px rgba(239,68,68,0.5)";
    setTimeout(() => {
      radarText.textContent = "CLEAR";
      radarText.style.color = "";
      radarText.style.textShadow = "";
    }, 4000);
  }

  // Dashboard recent alerts
  const dashList = document.getElementById("dashRecentAlerts");
  dashList.innerHTML = alertsCache.slice(0, 5).map(a => `
    <div class="det-row">
      <span class="cls">${a.object_class} — KM ${a.km_marker}</span>
      <span class="badge ${a.severity.toLowerCase()}">${a.severity}</span>
    </div>`).join("");

  // Alerts table
  const tbody = document.getElementById("alertsTableBody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="mono">${alertsCache.length}</td>
    <td class="mono">${new Date(alert.timestamp).toLocaleTimeString()}</td>
    <td>${alert.type}</td>
    <td>${alert.object_class}</td>
    <td class="mono">${(alert.confidence * 100).toFixed(0)}%</td>
    <td class="mono">${alert.km_marker}</td>
    <td><span class="badge ${alert.severity.toLowerCase()}">${alert.severity}</span></td>
    <td><span class="badge active">${alert.status}</span></td>
    <td><button class="btn" onclick="this.closest('tr').querySelector('.badge.active').outerHTML='<span class=\\'badge resolved\\'>Resolved</span>'; this.remove();">Mark Resolved</button></td>
  `;
  if (tbody.children[0]?.children.length === 1) tbody.innerHTML = "";
  tbody.prepend(row);

  document.getElementById("alertsToday").textContent = alertsCache.length;
  document.getElementById("alertsWeek").textContent = alertsCache.length;

  toast(`New alert: ${alert.object_class} detected (${alert.severity})`);
}

function handleDetectionEvent(det) {
  // Live Monitoring detection feed
  const feed = document.getElementById("liveDetFeed");
  if (feed.querySelector(".empty-state")) feed.innerHTML = "";
  const row = document.createElement("div");
  row.className = "det-row";
  row.innerHTML = `<span class="cls">${new Date(det.timestamp).toLocaleTimeString()} — ${det.class}</span><span class="conf mono">${(det.confidence * 100).toFixed(0)}%</span>`;
  feed.prepend(row);
  while (feed.children.length > 20) feed.removeChild(feed.lastChild);

  // Confidence meter
  document.getElementById("confMeter").style.width = (det.confidence * 100) + "%";

  // Frame analysis text (rough live estimate)
  document.getElementById("frameAnalysis").textContent = `Last object: ${det.class} @ ${(det.confidence*100).toFixed(0)}% confidence`;

  // Class counters
  const key = det.label || "debris";
  if (detectionCount[key] !== undefined) {
    detectionCount[key]++;
    const el = document.getElementById(`cnt-${key}`);
    if (el) el.textContent = detectionCount[key];
  }

  // Detection log table (AI Detection section)
  const logBody = document.getElementById("detectionLogBody");
  if (logBody.children[0]?.children.length === 1) logBody.innerHTML = "";
  const logRow = document.createElement("tr");
  logRow.innerHTML = `<td class="mono">${new Date(det.timestamp).toLocaleTimeString()}</td><td>${det.class}</td><td class="mono">${(det.confidence*100).toFixed(0)}%</td><td class="mono">${det.bbox?.join(",") || "-"}</td><td>🖼️</td>`;
  logBody.prepend(logRow);
  while (logBody.children.length > 15) logBody.removeChild(logBody.lastChild);
}

// ============================================================
// Static / simulated demo data (Track Health, Maintenance, Reports,
// Analytics history) — no backend needed for these yet.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  seedTrackSegments();
  seedMaintenance();
  seedReports();
  animateTrainDot();
  document.getElementById("repDate").value = new Date().toISOString().slice(0, 10);

  // Initial KPI count-up (demo baseline, before live stats arrive)
  setTimeout(() => {
    countUpTo(document.getElementById("kpiScanned"), 12.47, { decimals: 2, suffix: " km" });
    countUpTo(document.getElementById("kpiAlerts"), 0, { duration: 500 });
    countUpTo(document.getElementById("kpiUptime"), 99.8, { decimals: 1, suffix: "%" });
    countUpTo(document.getElementById("kpiAccuracy"), 91.4, { decimals: 1, suffix: "%" });
    countUpTo(document.getElementById("anTotalDet"), 284, { duration: 1200 });
  }, 900);
});

function seedTrackSegments() {
  const segments = [
    ["Segment A — KM 440–460", "healthy", "2026-08-14", 0],
    ["Segment B — KM 460–480", "monitor", "2026-08-13", 2],
    ["Segment C — KM 480–500", "healthy", "2026-08-14", 0],
    ["Segment D — KM 500–520", "critical", "2026-08-10", 5],
    ["Segment E — KM 520–540", "healthy", "2026-08-15", 1],
    ["Segment F — KM 540–560", "monitor", "2026-08-12", 3],
  ];
  const body = document.getElementById("segmentsBody");
  body.innerHTML = segments.map(([name, status, date, defects]) => `
    <tr><td>${name}</td><td><span class="badge ${status}">${status}</span></td><td class="mono">${date}</td><td class="mono">${defects}</td></tr>
  `).join("");
}

function seedMaintenance() {
  const upcoming = [
    ["Radar Unit — Recalibration", "Aug 22, 2026", "medium"],
    ["Thermal Camera — Lens Clean", "Aug 24, 2026", "low"],
    ["Mounting Bracket — Torque Check", "Aug 27, 2026", "high"],
  ];
  document.getElementById("upcomingMaint").innerHTML = upcoming.map(([name, date, pr]) => `
    <div class="flex-between mt"><span class="subtle">${name}<br><span class="mono" style="font-size:11px;">${date}</span></span><span class="badge ${pr}">${pr}</span></div>
  `).join("");

  const health = [["Radar Unit", 97], ["Camera Unit", 94], ["Laser Unit", 99], ["Mounting Hardware", 88]];
  document.getElementById("componentHealth").innerHTML = health.map(([name, pct]) => `
    <div class="mt"><div class="flex-between"><span class="subtle">${name}</span><span class="mono">${pct}%</span></div>
    <div class="progress-track mt"><div class="progress-fill" style="width:${pct}%"></div></div></div>
  `).join("");

  const history = [
    ["2026-08-05", "Radar Unit", "Firmware update", "R. Kumar", "resolved"],
    ["2026-07-28", "Laser System", "Alignment fix", "S. Priya", "resolved"],
    ["2026-07-20", "Mounting Hardware", "Bolt tightening", "R. Kumar", "resolved"],
  ];
  document.getElementById("maintHistoryBody").innerHTML = history.map(([d,c,a,t,s]) => `
    <tr><td class="mono">${d}</td><td>${c}</td><td>${a}</td><td>${t}</td><td><span class="badge ${s}">${s}</span></td></tr>
  `).join("");
}

function downloadReport(filename) {
  const content = `============================================================
RAILGUARD ITMS — COMMAND CENTER OFFICIAL REPORT
============================================================
Report Name : ${filename}
Generated On: ${new Date().toLocaleString()}
System Status: 100% Operational (ONLINE)
Scanned Track: 12.47 km
Detection Accuracy: 96.4%
Total Alerts Logged: ${alertsCache.length || 3}

------------------------------------------------------------
SYSTEM SUMMARY & SENSOR DIAGNOSTICS
------------------------------------------------------------
1. 77 GHz MMW Radar Array  : CALIBRATED (Signal 97%)
2. PTZ Thermal / IR Camera : ACTIVE (Signal 94%)
3. Dual-Stage Laser System : NOMINAL (Deviation 0.2mm)
4. GNSS/IMU Positioning    : LOCKED (Lat 11.0189, Long 76.9725)

------------------------------------------------------------
INCIDENT LOG & ALERT HIGHLIGHTS
------------------------------------------------------------
${alertsCache.length ? alertsCache.map((a, i) => `${i+1}. [${a.severity}] ${a.object_class} detected at Track KM ${a.km_marker} (${new Date(a.timestamp).toLocaleTimeString()})`).join("\n") : "1. [HIGH] person detected at Track KM 4.12\n2. [MEDIUM] vehicle detected at Track KM 8.75"}

------------------------------------------------------------
Team NEXUS — MSME Idea Hackathon 6.0 (Robotics & Automation)
============================================================`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".txt") || filename.endsWith(".pdf") ? filename.replace(".pdf", ".txt") : filename + ".txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  if (typeof toast === "function") toast(`Downloaded ${filename}`);
}

function seedReports() {
  const reports = [
    ["Daily_Summary_2026-08-15.pdf", "Aug 15, 2026", "1.2 MB"],
    ["Weekly_Analysis_W33.pdf", "Aug 11, 2026", "3.4 MB"],
    ["Incident_Report_0091.pdf", "Aug 09, 2026", "0.8 MB"],
  ];
  document.getElementById("reportsBody").innerHTML = reports.map(([n,d,s]) => `
    <tr style="cursor:pointer;" onclick="downloadReport('${n}')">
      <td><span style="color:var(--cyan);text-decoration:underline;">${n}</span></td>
      <td class="mono">${d}</td>
      <td class="mono">${s}</td>
      <td><button class="btn" style="padding:4px 8px;" onclick="event.stopPropagation(); downloadReport('${n}');"><i data-lucide="download"></i> Download</button></td>
    </tr>
  `).join("");
  lucide.createIcons();
}


function animateTrainDot() {
  const path = document.querySelector("#sec-track path");
  const dot = document.getElementById("trainDot");
  if (!path || !dot) return;
  const len = path.getTotalLength();
  let t = 0;
  setInterval(() => {
    t = (t + 0.002) % 1;
    const pt = path.getPointAtLength(t * len);
    dot.setAttribute("cx", pt.x);
    dot.setAttribute("cy", pt.y);
  }, 30);
}

// Simulated GPS ticker (until real IMU/GPS data is wired in)
setInterval(() => {
  const el = document.getElementById("gpsCoords");
  if (!el) return;
  const lat = (11.0189 + Math.random() * 0.0005).toFixed(4);
  const lng = (76.9725 + Math.random() * 0.0005).toFixed(4);
  el.textContent = `Lat ${lat}, Long ${lng}`;
}, 4000);

// Simulated TTR / event log ticker for AI Detection section
setInterval(() => {
  const ttr = document.getElementById("ttrValue");
  if (ttr) ttr.textContent = (3 + Math.random() * 3).toFixed(1) + "s";
}, 5000);
