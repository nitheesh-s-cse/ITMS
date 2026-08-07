import { useState } from 'react';
import { DETECTION_CLASSES, DETECTION_LOG } from '../data/mockData';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);



const confBuckets = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'];
const confCounts = [1, 0, 2, 1, 3, 4, 8, 12, 24, 18];
const histogramData = {
  labels: confBuckets,
  datasets: [{
    label: 'Count',
    data: confCounts,
    backgroundColor: confCounts.map((_, idx) => {
      const t = idx / 9;
      const rC = Math.round(239 * (1 - t) + 16 * t);
      const gC = Math.round(68 * (1 - t) + 185 * t);
      const bC = Math.round(68 * (1 - t) + 129 * t);
      return `rgba(${rC},${gC},${bC},0.7)`;
    }),
    borderRadius: 4,
  }],
};
const histOpts: any = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', borderColor: 'rgba(6,182,212,0.3)', borderWidth: 1 } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 9 } } },
    y: { grid: { color: 'rgba(30,41,59,0.5)' }, ticks: { color: '#475569', font: { size: 9 } } },
  },
};

function EventLogFlow() {
  const events = [
    { label: 'Sensor Input', color: '#06b6d4', icon: '📡' },
    { label: 'Threshold Breach', color: '#f59e0b', icon: '⚡' },
    { label: 'YOLOv8 Classify', color: '#8b5cf6', icon: '🧠' },
    { label: 'Multi-Sensor Correlation', color: '#06b6d4', icon: '🔗' },
    { label: 'Risk Score Evaluate', color: '#f59e0b', icon: '⚖️' },
    { label: 'Alert Dispatched', color: '#ef4444', icon: '🚨' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', rowGap: '4px', columnGap: 0 }}>
      {events.map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            background: `${e.color}15`, border: `1px solid ${e.color}40`,
            borderRadius: 6, padding: '6px 10px',
            fontSize: 11, color: e.color, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
          }}>
            <span>{e.icon}</span> {e.label}
          </div>
          {i < events.length - 1 && (
            <div style={{ fontSize: 12, color: '#1e3a5f', margin: '0 4px' }}>→</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AIDetection() {
  const [threshold, setThreshold] = useState(0.5);

  return (
    <div className="section-content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Model Card */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>🧠</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>YOLOv8 Object Classification</div>
                <div style={{ fontSize: 11, color: '#475569' }}>Edge AI · Multi-Sensor Fusion Engine</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {['NVIDIA Jetson Orin', 'Radar + IR + Laser', 'TensorRT FP16', 'ROS 2 Humble'].map(t => (
                <span key={t} style={{
                  background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
                  color: '#22d3ee', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600
                }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: '#10b981' }}>94.2%</div>
              <div style={{ fontSize: 10, color: '#475569' }}>Precision</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: '#06b6d4' }}>91.8%</div>
              <div style={{ fontSize: 10, color: '#475569' }}>Recall</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>89.4%</div>
              <div style={{ fontSize: 10, color: '#475569' }}>mAP@50</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: '#22d3ee' }}>28ms</div>
              <div style={{ fontSize: 10, color: '#475569' }}>Inference</div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Trigger Logic */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 12 }}>EVENT TRIGGER PIPELINE</div>
        <EventLogFlow />
      </div>

      {/* Detection Classes + Histogram */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Classes */}
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 12 }}>DETECTION CLASSES — TODAY</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {DETECTION_CLASSES.map(c => (
              <div key={c.class} style={{
                background: `${c.color}08`, border: `1px solid ${c.color}20`,
                borderRadius: 8, padding: '10px 12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: c.color }}>{c.count}</span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{c.class}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge badge-${c.risk === 'CRITICAL' ? 'critical' : c.risk === 'HIGH' ? 'warning' : 'info'}`}
                    style={{ fontSize: 9 }}>{c.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Histogram */}
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 12 }}>CONFIDENCE DISTRIBUTION</div>
          <div style={{ height: 180 }}>
            <Bar data={histogramData} options={histOpts} />
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Detection Sensitivity Threshold</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#06b6d4', fontWeight: 700 }}>
                {(threshold * 100).toFixed(0)}%
              </span>
            </div>
            <input type="range" min="0.1" max="0.9" step="0.05" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Detection Log Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(6,182,212,0.1)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
          📋 Detection Log
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Class</th>
                <th>Confidence</th>
                <th>Bounding Box</th>
                <th>Snapshot</th>
              </tr>
            </thead>
            <tbody>
              {DETECTION_LOG.map((d, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#94a3b8' }}>{d.ts}</td>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{d.cls}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-bar-fill" style={{
                          width: `${d.conf}%`,
                          background: d.conf >= 90 ? '#10b981' : d.conf >= 70 ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: d.conf >= 90 ? '#10b981' : '#f59e0b' }}>{d.conf}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#475569' }}>{d.bbox}</td>
                  <td>{d.snap ? <span className="badge badge-success" style={{ fontSize: 9 }}>Saved</span> : <span style={{ color: '#1e3a5f', fontSize: 11 }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
