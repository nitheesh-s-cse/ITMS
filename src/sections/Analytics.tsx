import { useState } from 'react';
import { ANALYTICS_7D } from '../data/mockData';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

type Range = 'Today' | 'Week' | 'Month';

const chartDefaults = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#0f172a', borderColor: 'rgba(6,182,212,0.3)', borderWidth: 1 }
  }
};

const scaleDefaults = {
  x: { grid: { color: 'rgba(30,41,59,0.5)' }, ticks: { color: '#475569', font: { size: 9 } } },
  y: { grid: { color: 'rgba(30,41,59,0.5)' }, ticks: { color: '#475569', font: { size: 9 } } },
};

export default function Analytics() {
  const [range, setRange] = useState<Range>('Week');

  const detectionLine = {
    labels: ANALYTICS_7D.labels,
    datasets: [{
      label: 'Detections',
      data: ANALYTICS_7D.detections,
      fill: true, borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.07)',
      tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#06b6d4'
    }],
  };

  const severityDonut = {
    labels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    datasets: [{
      data: [11, 19, 12, 5],
      backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(6,182,212,0.7)', 'rgba(71,85,105,0.7)'],
      borderColor: ['#ef4444', '#f59e0b', '#06b6d4', '#475569'],
      borderWidth: 1,
    }],
  };

  const classFreq = {
    labels: ['Debris', 'Dog', 'Person', 'Cow', 'Bicycle', 'Car', 'Truck', 'Horse'],
    datasets: [{
      label: 'Detections',
      data: [87, 54, 32, 19, 14, 11, 7, 3],
      backgroundColor: 'rgba(6,182,212,0.5)',
      borderColor: '#06b6d4',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const uptimeArea = {
    labels: ANALYTICS_7D.labels,
    datasets: [{
      label: 'Uptime %',
      data: ANALYTICS_7D.uptime,
      fill: true, borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.07)',
      tension: 0.4, borderWidth: 2, pointRadius: 0,
    }],
  };

  const rtLine = {
    labels: ANALYTICS_7D.labels,
    datasets: [{
      label: 'Response Time (s)',
      data: ANALYTICS_7D.responseTime,
      fill: false, borderColor: '#f59e0b',
      backgroundColor: '#f59e0b',
      tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#f59e0b',
    }, {
      label: '1s Threshold',
      data: ANALYTICS_7D.labels.map(() => 1.0),
      fill: false, borderColor: 'rgba(239,68,68,0.4)',
      borderDash: [4, 4], borderWidth: 1, pointRadius: 0,
    }],
  };

  const rtOpts: any = {
    ...chartDefaults,
    plugins: { ...chartDefaults.plugins, legend: { display: true, labels: { color: '#94a3b8', font: { size: 10 }, padding: 8 } } },
    scales: { ...scaleDefaults, y: { ...scaleDefaults.y, min: 0, max: 1.5, ticks: { color: '#475569', font: { size: 9 } } } },
  };

  const SUMMARIES = [
    { label: 'Total Detections', value: '2,847', unit: 'this month', color: '#06b6d4' },
    { label: 'Total Distance Monitored', value: '4,320 km', unit: 'cumulative', color: '#10b981' },
    { label: 'Avg Daily Alerts', value: '6.7', unit: 'per day', color: '#f59e0b' },
    { label: 'System Efficiency', value: '98.4%', unit: 'SLA', color: '#10b981' },
  ];

  return (
    <div className="section-content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {SUMMARIES.map(s => (
          <div key={s.label} className="kpi-card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Range selector */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#475569' }}>Date Range:</span>
        {(['Today', 'Week', 'Month'] as Range[]).map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: '5px 14px', border: '1px solid', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: range === r ? 'rgba(6,182,212,0.15)' : 'transparent',
            borderColor: range === r ? 'rgba(6,182,212,0.4)' : 'rgba(30,41,59,0.8)',
            color: range === r ? '#22d3ee' : '#475569', transition: 'all 0.2s'
          }}>{r}</button>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>📈 Detections Over Time (7d)</div>
          <div style={{ height: 160 }}><Line data={detectionLine} options={{ ...chartDefaults, scales: scaleDefaults } as any} /></div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>🥧 Alert Severity Distribution</div>
          <div style={{ height: 160 }}>
            <Doughnut data={severityDonut} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: true, position: 'right', labels: { color: '#94a3b8', font: { size: 9 }, padding: 6 } } } } as any} />
          </div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>📊 Object Class Frequency</div>
          <div style={{ height: 160 }}>
            <Bar data={classFreq} options={{ ...chartDefaults, indexAxis: 'y', scales: { x: scaleDefaults.x, y: { ...scaleDefaults.y, grid: { display: false } } } } as any} />
          </div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>⬆️ System Uptime % (7d)</div>
          <div style={{ height: 160 }}>
            <Line data={uptimeArea} options={{ ...chartDefaults, scales: { ...scaleDefaults, y: { ...scaleDefaults.y, min: 99, max: 100.1, ticks: { color: '#475569', font: { size: 9 } } } } } as any} />
          </div>
        </div>
      </div>

      {/* Response Time — featured */}
      <div className="glass-card" style={{ padding: 20, border: '1px solid rgba(245,158,11,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>⚡ System Response Time Trend</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Consistently sub-second — core architectural guarantee</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: '#10b981' }}>0.30s</div>
            <div style={{ fontSize: 10, color: '#475569' }}>Avg this week</div>
          </div>
        </div>
        <div style={{ height: 140 }}><Line data={rtLine} options={rtOpts} /></div>
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, fontSize: 11, color: '#10b981' }}>
          ✅ All readings below 1-second threshold — SLA target maintained · Avg: 0.30s · Peak: 0.34s
        </div>
      </div>
    </div>
  );
}
