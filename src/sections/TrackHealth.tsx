import { useState, useEffect } from 'react';
import { TRACK_SEGMENTS } from '../data/mockData';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const healthColor = (h: number) => h >= 85 ? '#10b981' : h >= 65 ? '#f59e0b' : '#ef4444';
const statusLabel: Record<string, string> = { healthy: 'Healthy', monitor: 'Monitor', warning: 'Warning', critical: 'Critical' };
const statusBadge: Record<string, string> = { healthy: 'badge-success', monitor: 'badge-info', warning: 'badge-warning', critical: 'badge-critical' };

function TrackMapSVG({ trainPos }: { trainPos: number }) {
  // SVG track route with curves
  const trackPath = "M 40,240 C 80,240 100,200 140,180 S 200,140 260,130 S 340,120 400,110 S 480,100 540,120 S 600,150 640,180";
  const segments = TRACK_SEGMENTS;

  return (
    <svg viewBox="0 0 680 280" style={{ width: '100%', height: '100%' }}>
      {/* Grid lines */}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={i * 100} y1="0" x2={i * 100} y2="280" stroke="rgba(6,182,212,0.04)" strokeWidth="1" />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1="0" y1={i * 70} x2="680" y2={i * 70} stroke="rgba(6,182,212,0.04)" strokeWidth="1" />
      ))}

      {/* Track shadow */}
      <path d={trackPath} fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="12" strokeLinecap="round" />

      {/* Segment coloring */}
      {segments.map((seg, i) => {
        const x1 = 40 + i * 85;
        const x2 = x1 + 80;
        return (
          <line key={seg.id} x1={x1} y1={230 - i * 15} x2={x2} y2={230 - (i + 1) * 15}
            stroke={healthColor(seg.health)} strokeWidth="4" strokeLinecap="round"
            opacity="0.8" />
        );
      })}

      {/* Main track */}
      <path d={trackPath} fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="2" strokeDasharray="6,4" />

      {/* KM markers */}
      {[0, 20, 40, 60, 80, 100, 120].map((km, i) => (
        <g key={km}>
          <circle cx={40 + i * 93} cy={240 - i * 18} r="3" fill="rgba(6,182,212,0.3)" />
          <text x={40 + i * 93} y={240 - i * 18 + 14} textAnchor="middle"
            style={{ fill: '#1e3a5f', fontSize: 7, fontFamily: 'JetBrains Mono' }}>KM{km}</text>
        </g>
      ))}

      {/* Train dot */}
      <g transform={`translate(${40 + trainPos * 5.8}, ${240 - trainPos * 1.7})`}>
        <circle r="8" fill="#06b6d4" opacity="0.2" />
        <circle r="5" fill="#06b6d4" style={{ filter: 'drop-shadow(0 0 6px #06b6d4)' }} />
        <text y="-12" textAnchor="middle" style={{ fill: '#22d3ee', fontSize: 8, fontFamily: 'JetBrains Mono' }}>🚆</text>
      </g>

      {/* Critical segments */}
      {segments.filter(s => s.status === 'critical').map((seg, _i) => (
        <g key={seg.id}>
          <circle cx={40 + 4 * 93} cy={240 - 4 * 18} r="10" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1" />
          <circle cx={40 + 4 * 93} cy={240 - 4 * 18} r="4" fill="#ef4444" style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }} />
        </g>
      ))}

      {/* Legend */}
      <g transform="translate(10, 10)">
        {[['#10b981', 'Healthy'], ['#f59e0b', 'Monitor'], ['#ef4444', 'Critical']].map(([c, l], i) => (
          <g key={l} transform={`translate(${i * 90}, 0)`}>
            <circle cx="6" cy="6" r="5" fill={c} opacity="0.7" />
            <text x="14" y="10" style={{ fill: '#475569', fontSize: 8, fontFamily: 'Inter' }}>{l}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function SegmentGauge({ value, color }: { value: number; color: string }) {
  const r = 16; const circ = 2 * Math.PI * r;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth="4" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${(value / 100) * circ} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 20 20)" />
      <text x="20" y="24" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fill: '#e2e8f0', fontSize: 7, fontWeight: 700 }}>{value}</text>
    </svg>
  );
}

const labels30d = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  return `${d.getMonth() + 1}/${d.getDate()}`;
});
const healthTrend = Array.from({ length: 30 }, (_, i) => 82 + Math.sin(i * 0.3) * 8 + Math.random() * 4);

const trendData = {
  labels: labels30d,
  datasets: [{
    label: 'Avg Track Health %',
    data: healthTrend,
    fill: true,
    borderColor: '#10b981',
    backgroundColor: 'rgba(16,185,129,0.06)',
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 0,
  }],
};
const trendOpts: any = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', borderColor: 'rgba(16,185,129,0.3)', borderWidth: 1 } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#1e3a5f', font: { size: 8 }, maxTicksLimit: 8 } },
    y: { min: 70, max: 100, grid: { color: 'rgba(30,41,59,0.5)' }, ticks: { color: '#475569', font: { size: 9 } } },
  },
};

export default function TrackHealth() {
  const [trainPos, setTrainPos] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTrainPos(p => (p + 1) % 100), 150);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="section-content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* SVG Map */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(6,182,212,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>🗺️ Live Track Route Map</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="status-dot cyan" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#22d3ee' }}>TRAIN @ KM {trainPos.toFixed(0)}.{Math.floor(Math.random() * 9)}</span>
          </div>
        </div>
        <div style={{ height: 240, padding: 16 }}>
          <TrackMapSVG trainPos={trainPos} />
        </div>
      </div>

      {/* Segments list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {TRACK_SEGMENTS.map(seg => (
          <div key={seg.id} className="glass-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
            <SegmentGauge value={seg.health} color={healthColor(seg.health)} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seg.name}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                <span className={`badge ${statusBadge[seg.status]}`} style={{ fontSize: 9 }}>{statusLabel[seg.status]}</span>
                <span style={{ fontSize: 10, color: '#475569' }}>Defects: {seg.defects}</span>
              </div>
              <div style={{ fontSize: 10, color: '#1e3a5f', marginTop: 2 }}>Scanned: {seg.lastScanned}</div>
            </div>
            <div className="progress-bar" style={{ width: 50, flexShrink: 0 }}>
              <div className="progress-bar-fill" style={{ width: `${seg.health}%`, background: healthColor(seg.health) }} />
            </div>
          </div>
        ))}
      </div>

      {/* 30-day trend */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 16 }}>📈 30-Day Track Health Trend</div>
        <div style={{ height: 160 }}>
          <Line data={trendData} options={trendOpts} />
        </div>
      </div>
    </div>
  );
}
