// ============================================================
// Chart.js — global defaults matching the industrial theme
// ============================================================
Chart.defaults.color = "#94a3b8";
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = "rgba(148,163,184,0.08)";

const cyan = "#22d3ee";
const cyanDim = "#06b6d4";
const amber = "#f59e0b";
const red = "#ef4444";
const emerald = "#10b981";

function gradient(ctx, color) {
  const g = ctx.createLinearGradient(0, 0, 0, 200);
  g.addColorStop(0, color + "55");
  g.addColorStop(1, color + "00");
  return g;
}

const hoursLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const randSeries = (n, min, max) => Array.from({ length: n }, () => Math.floor(Math.random() * (max - min) + min));

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Dashboard: 24h detections ----------
  const ctx24h = document.getElementById("chartDash24h")?.getContext("2d");
  if (ctx24h) {
    new Chart(ctx24h, {
      type: "line",
      data: {
        labels: hoursLabels,
        datasets: [{
          data: randSeries(24, 2, 40),
          borderColor: cyan,
          backgroundColor: gradient(ctx24h, cyan),
          fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2,
        }],
      },
      options: baseOpts(),
    });
  }

  // ---------- Dashboard: health gauge ----------
  const gaugeCtx = document.getElementById("gaugeHealth")?.getContext("2d");
  if (gaugeCtx) {
    new Chart(gaugeCtx, {
      type: "doughnut",
      data: { datasets: [{ data: [98, 2], backgroundColor: [cyan, "rgba(148,163,184,0.1)"], borderWidth: 0 }] },
      options: { cutout: "78%", rotation: -90, circumference: 360, plugins: { legend: { display: false }, tooltip: { enabled: false } } },
    });
  }

  // ---------- Sensor sparklines ----------
  ["sparkRadar", "sparkLaser"].forEach(id => {
    const c = document.getElementById(id)?.getContext("2d");
    if (!c) return;
    new Chart(c, {
      type: "line",
      data: { labels: Array(20).fill(""), datasets: [{ data: randSeries(20, 30, 60), borderColor: cyanDim, borderWidth: 1.5, pointRadius: 0, tension: 0.4 }] },
      options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } }, animation: false },
    });
  });

  // ---------- AI Detection: confidence distribution ----------
  const confCtx = document.getElementById("chartConfDist")?.getContext("2d");
  if (confCtx) {
    new Chart(confCtx, {
      type: "bar",
      data: {
        labels: ["0.1-0.3", "0.3-0.5", "0.5-0.7", "0.7-0.9", "0.9-1.0"],
        datasets: [{ data: [3, 8, 22, 41, 19], backgroundColor: cyanDim, borderRadius: 4 }],
      },
      options: baseOpts(),
    });
  }

  // ---------- Alerts: severity donut ----------
  const sevCtx = document.getElementById("chartAlertSeverity")?.getContext("2d");
  if (sevCtx) {
    new Chart(sevCtx, {
      type: "doughnut",
      data: { labels: ["High", "Medium", "Low"], datasets: [{ data: [5, 12, 20], backgroundColor: [red, amber, emerald], borderWidth: 0 }] },
      options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } } },
    });
  }

  // ---------- Track Health: 30-day trend ----------
  const trackCtx = document.getElementById("chartTrackTrend")?.getContext("2d");
  if (trackCtx) {
    new Chart(trackCtx, {
      type: "line",
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
        datasets: [{ data: randSeries(30, 85, 99), borderColor: emerald, backgroundColor: gradient(trackCtx, emerald), fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 }],
      },
      options: baseOpts(),
    });
  }

  // ---------- Analytics ----------
  const anDetCtx = document.getElementById("chartAnDet")?.getContext("2d");
  if (anDetCtx) {
    new Chart(anDetCtx, {
      type: "line",
      data: { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], datasets: [{ data: randSeries(7, 40, 120), borderColor: cyan, backgroundColor: gradient(anDetCtx, cyan), fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 }] },
      options: baseOpts(),
    });
  }

  const anSevCtx = document.getElementById("chartAnSeverity")?.getContext("2d");
  if (anSevCtx) {
    new Chart(anSevCtx, { type: "doughnut", data: { labels: ["High","Medium","Low"], datasets: [{ data: [8,19,33], backgroundColor: [red, amber, emerald], borderWidth: 0 }] }, options: { plugins: { legend: { position: "bottom" } } } });
  }

  const anClassCtx = document.getElementById("chartAnClass")?.getContext("2d");
  if (anClassCtx) {
    new Chart(anClassCtx, { type: "bar", data: { labels: ["Person","Animal","Vehicle","Debris"], datasets: [{ data: [34, 61, 22, 9], backgroundColor: cyanDim, borderRadius: 4 }] }, options: { indexAxis: "y", ...baseOpts() } });
  }

  const anRespCtx = document.getElementById("chartAnResponse")?.getContext("2d");
  if (anRespCtx) {
    new Chart(anRespCtx, { type: "line", data: { labels: Array.from({length:14},(_,i)=>`D${i+1}`), datasets: [{ data: Array.from({length:14},()=> (0.3+Math.random()*0.5).toFixed(2)), borderColor: emerald, tension: 0.3, pointRadius: 0, borderWidth: 2 }] }, options: baseOpts() });
  }

  function baseOpts() {
    return {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: "rgba(148,163,184,0.06)" }, ticks: { font: { size: 10 } } },
      },
      elements: { point: { radius: 0 } },
    };
  }
});
