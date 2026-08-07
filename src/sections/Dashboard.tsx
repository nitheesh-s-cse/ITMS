import { useState } from 'react';
import { useCountUp } from '../hooks/useCountUp';
import { useInterval } from '../hooks/useCountUp';

// Chart.js
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RECENT_ALERTS = [
  { time: '10:48', obj: 'Cow on Track', km: '67.3', sev: 'HIGH', color: '#f59e0b' },
  { time: '10:31', obj: 'Person Detected', km: '34.1', sev: 'CRITICAL', color: '#ef4444' },
  { time: '10:12', obj: 'Track Crack — Sec-C', km: '51.8', sev: 'HIGH', color: '#f59e0b' },
  { time: '09:55', obj: 'Debris on Rail', km: '83.0', sev: 'MEDIUM', color: '#06b6d4' },
  { time: '09:22', obj: 'Radar Dropout', km: '—', sev: 'LOW', color: '#475569' },
];

function CircularGauge({ value, label, color = '#06b6d4' }: { value: number; label: string; color?: string }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
        <text x="55" y="52" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: 'JetBrains Mono', fill: '#e2e8f0', fontSize: 16, fontWeight: 600 }}>{value}%</text>
        <text x="55" y="68" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: 'Inter', fill: '#94a3b8', fontSize: 8 }}>{label}</text>
      </svg>
    </div>
  );
}

function SensorStrip() {
  const sensors = [
    { name: 'Radar 77GHz', status: 'NOMINAL', color: '#10b981' },
    { name: 'Thermal Cam', status: 'NOMINAL', color: '#10b981' },
    { name: 'Laser System', status: 'WARN', color: '#f59e0b' },
    { name: 'GPS-IMU', status: 'NOMINAL', color: '#10b981' },
  ];
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {sensors.map(s => (
        <div key={s.name} style={{
          background: 'rgba(15,23,42,0.6)', border: `1px solid ${s.color}30`,
          borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span className="status-dot" style={{ background: s.color, animation: s.color === '#10b981' ? 'pulse-glow 2s infinite' : 'pulse-amber 2s infinite' }} />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.name}</span>
          <span style={{ fontSize: 10, color: s.color, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{s.status}</span>
        </div>
      ))}
    </div>
  );
}

const LINE_LABELS = ['00h','02h','04h','06h','08h','10h','12h','14h','16h','18h','20h','22h'];
const LINE_DATA   = [2, 1, 0, 3, 8, 12, 9, 14, 11, 7, 6, 5];

const lineData = {
  labels: LINE_LABELS,
  datasets: [{
    label: 'Detections',
    data: LINE_DATA,
    fill: true,
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6,182,212,0.08)',
    pointBackgroundColor: '#06b6d4',
    pointRadius: 3,
    tension: 0.4,
    borderWidth: 2,
  }],
};

const lineOpts: any = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', borderColor: 'rgba(6,182,212,0.3)', borderWidth: 1 } },
  scales: {
    x: { grid: { color: 'rgba(30,41,59,0.6)' }, ticks: { color: '#475569', font: { size: 10 } } },
    y: { grid: { color: 'rgba(30,41,59,0.6)' }, ticks: { color: '#475569', font: { size: 10 } } },
  },
};

export default function Dashboard({ liveStats }: { liveStats: any }) {
  const trackScanned = useCountUp(liveStats?.trackScanned ?? 287, 1500);
  const activeAlerts = useCountUp(liveStats?.activeAlerts ?? 2, 800);
  const uptime = useCountUp(liveStats?.uptime ?? 99.97, 1500, 2);
  const accuracy = useCountUp(liveStats?.accuracy ?? 98.3, 1500, 1);

  const [chartData, setChartData] = useState(LINE_DATA);
  useInterval(() => {
    setChartData(prev => {
      const next = [...prev.slice(1), Math.max(0, prev[prev.length - 1] + Math.round((Math.random() - 0.4) * 3))];
      return next;
    });
  }, 4000);

  const dynLineData = { ...lineData, datasets: [{ ...lineData.datasets[0], data: chartData }] };

  const KPIS = [
    { label: 'Track Scanned Today', value: `${Math.round(trackScanned)} km`, icon: '📏', sub: '↑ 14 km vs yesterday', trend: 'up', color: '#06b6d4' },
    { label: 'Active Alerts', value: String(Math.round(activeAlerts)), icon: '⚠️', sub: '2 CRITICAL, 0 NEW', trend: activeAlerts > 3 ? 'up' : 'down', color: '#ef4444' },
    { label: 'System Uptime', value: `${uptime.toFixed(2)}%`, icon: '⏱️', sub: 'Since 00:00 IST today', trend: 'up', color: '#10b981' },
    { label: 'Detection Accuracy', value: `${accuracy.toFixed(1)}%`, icon: '🎯', sub: 'YOLOv8 + Sensor Fusion', trend: 'up', color: '#f59e0b' },
  ];

  return (
    <div className="section-content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {KPIS.map(k => (
          <div key={k.label} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{k.icon}</span>
              <span style={{ fontSize: 10, color: k.color, fontWeight: 700, background: `${k.color}18`, padding: '2px 6px', borderRadius: 4 }}>
                {k.trend === 'up' ? '▲' : '▼'} LIVE
              </span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 26, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{k.label}</div>
            <div style={{ fontSize: 10, color: k.color, marginTop: 4, fontWeight: 500 }}>{k.sub}</div>
            <div style={{ marginTop: 12, height: 3, background: 'rgba(30,41,59,0.8)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg, ${k.color}80, ${k.color})`, borderRadius: 2, transition: 'width 1.5s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Row: Camera + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: 16 }}>
        {/* Camera Feed */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(6,182,212,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>🎥 Live Camera Feed</span>
            <div className="live-badge">LIVE</div>
          </div>
          <div style={{ position: 'relative', background: '#060a10', aspectRatio: '16/9' }}>
            <img
              src="http://10.213.209.213:8080/video"
              alt="Live Camera Feed"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Scan line overlay */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', gap: 8
            }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
              <div style={{ position: 'absolute', top: 10, left: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#10b981' }}>
                ◉ REC • 30fps • 1920×1080
              </div>
              <div style={{ position: 'absolute', bottom: 10, left: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#22d3ee' }}>
                KM 67.3 • 10:48:23 IST • JETSON ORIN
              </div>
            </div>
            {/* No feed placeholder */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,10,16,0.95)', zIndex: -1 }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📷</div>
              <div style={{ fontSize: 12, color: '#475569' }}>Camera offline — Awaiting connection</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1e3a5f', marginTop: 4 }}>http://10.213.209.213:8080</div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="glass-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>⚠️ Recent Alerts</div>
          {RECENT_ALERTS.map((a, i) => (
            <div key={i} style={{
              background: 'rgba(15,23,42,0.5)', border: `1px solid ${a.color}20`,
              borderLeft: `3px solid ${a.color}`, borderRadius: 6, padding: '8px 10px',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#475569', flexShrink: 0 }}>{a.time}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.obj}</div>
                <div style={{ fontSize: 10, color: '#475569' }}>KM {a.km}</div>
              </div>
              <span className={`badge badge-${a.sev === 'CRITICAL' ? 'critical' : a.sev === 'HIGH' ? 'warning' : a.sev === 'MEDIUM' ? 'info' : ''}`}
                style={{ fontSize: 9, padding: '1px 6px' }}>{a.sev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Strip + Gauge Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, fontWeight: 600, letterSpacing: '0.5px' }}>SENSOR ARRAY STATUS</div>
          <SensorStrip />
        </div>
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularGauge value={98} label="System Health" color="#10b981" />
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 16 }}>📈 Detections Over Last 24 Hours</div>
        <div style={{ height: 200 }}>
          <Line data={dynLineData} options={lineOpts} />
        </div>
      </div>
    </div>
  );
}
