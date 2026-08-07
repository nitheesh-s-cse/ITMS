import { useState } from 'react';
import { ALERTS_DATA } from '../data/mockData';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);


const statusColors: Record<string, string> = {
  Active: '#ef4444', Acknowledged: '#f59e0b', Resolved: '#10b981'
};

function AlertDetailModal({ alert, onClose }: { alert: typeof ALERTS_DATA[0]; onClose: () => void }) {
  const [note, setNote] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, color: '#e2e8f0' }}>🚨 Alert Detail — {alert.id}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        {/* Snapshot area */}
        <div style={{ background: 'rgba(10,14,23,0.8)', borderRadius: 8, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px solid rgba(6,182,212,0.1)' }}>
          <div style={{ textAlign: 'center', color: '#1e3a5f' }}>
            <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>🖼️</div>
            <div style={{ fontSize: 12 }}>Snapshot — {alert.ts}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            ['Alert ID', alert.id], ['Timestamp', alert.ts],
            ['Object Type', alert.object], ['Confidence', `${alert.confidence}%`],
            ['KM Marker', `KM ${alert.km}`], ['Severity', alert.severity],
            ['Status', alert.status], ['Priority', `P${alert.priority}`],
          ].map(([l, v]) => (
            <div key={l} style={{ padding: '8px 10px', background: 'rgba(15,23,42,0.5)', borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>

        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Add operator note..."
          className="input-field"
          style={{ height: 70, resize: 'none', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={() => { alert && onClose(); }}>📢 Notify Control Room</button>
          <button className="btn-success" onClick={onClose}>💾 Save Note</button>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(30,41,59,0.8)', color: '#475569', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

const pieData = {
  labels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
  datasets: [{
    data: [3, 4, 2, 1],
    backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(6,182,212,0.7)', 'rgba(71,85,105,0.7)'],
    borderColor: ['#ef4444', '#f59e0b', '#06b6d4', '#475569'],
    borderWidth: 1,
  }],
};
const pieOpts: any = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, padding: 8 } },
    tooltip: { backgroundColor: '#0f172a', borderColor: 'rgba(6,182,212,0.3)', borderWidth: 1 }
  }
};

export default function Alerts({ liveAlerts }: { liveAlerts?: typeof ALERTS_DATA }) {
  const [tab, setTab] = useState<'All' | 'Active' | 'Resolved'>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof ALERTS_DATA[0] | null>(null);
  const alerts = liveAlerts || ALERTS_DATA;

  const filtered = alerts.filter(a => {
    const matchTab = tab === 'All' || (tab === 'Active' ? a.status === 'Active' || a.status === 'Acknowledged' : a.status === 'Resolved');
    const matchSearch = !search || a.id.includes(search) || a.object.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="section-content" style={{ padding: 24 }}>
      {/* Emergency indicator */}
      <div style={{
        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 10, padding: '12px 16px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <span className="status-dot red" />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>EMERGENCY ESCALATION: </span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Auto-brake advisory active for KM 34.1 — Section Control Room notified</span>
        </div>
        <span className="badge badge-critical" style={{ fontSize: 10 }}>CRITICAL ZONE</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Left: table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Tabs + Search */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(6,182,212,0.1)', borderRadius: 8, overflow: 'hidden' }}>
              {(['All', 'Active', 'Resolved'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '7px 16px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: tab === t ? 'rgba(6,182,212,0.15)' : 'transparent',
                  color: tab === t ? '#22d3ee' : '#475569', borderRight: '1px solid rgba(6,182,212,0.08)',
                  transition: 'all 0.2s'
                }}>{t}</button>
              ))}
            </div>
            <input
              className="input-field"
              style={{ maxWidth: 200 }}
              placeholder="Search alerts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Object</th>
                    <th>Conf.</th>
                    <th>KM</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#1e3a5f' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>
                      <div>No alerts found</div>
                    </td></tr>
                  ) : filtered.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8' }}>{a.id}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{a.ts}</td>
                      <td style={{ fontSize: 12 }}>{a.type}</td>
                      <td style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 12 }}>{a.object}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: a.confidence >= 90 ? '#10b981' : '#f59e0b' }}>{a.confidence}%</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8' }}>{a.km}</td>
                      <td>
                        <span className={`badge badge-${a.severity === 'CRITICAL' ? 'critical' : a.severity === 'HIGH' ? 'warning' : a.severity === 'MEDIUM' ? 'info' : ''}`}
                          style={{ fontSize: 9 }}>{a.severity}</span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: statusColors[a.status] }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[a.status], display: 'inline-block' }} />
                          {a.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-primary" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => setSelected(a)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* De-dup info */}
          <div style={{ fontSize: 11, color: '#1e3a5f', padding: '6px 10px', background: 'rgba(6,182,212,0.04)', borderRadius: 6, border: '1px solid rgba(6,182,212,0.08)' }}>
            ⚡ False-positive de-duplication: 14 low-confidence events suppressed today · Sensor fusion cross-validation: active
          </div>
        </div>

        {/* Right: chart + summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 12 }}>SEVERITY BREAKDOWN</div>
            <div style={{ height: 180 }}>
              <Doughnut data={pieData} options={pieOpts} />
            </div>
          </div>
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 12 }}>SUMMARY</div>
            {[['Total Today', '10', '#e2e8f0'], ['Active', '2', '#ef4444'], ['Acknowledged', '2', '#f59e0b'], ['Resolved', '6', '#10b981'], ['This Week', '47', '#94a3b8']].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(30,41,59,0.5)' }}>
                <span style={{ fontSize: 12, color: '#475569' }}>{l}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>
          {/* Tiered response */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 12 }}>RESPONSE STATE</div>
            {[
              { label: 'CAUTION', sub: 'Advisory issued', color: '#06b6d4', active: false },
              { label: 'SLOW', sub: 'Speed reduction', color: '#f59e0b', active: true },
              { label: 'STOP', sub: 'Emergency brake', color: '#ef4444', active: false },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 6, marginBottom: 6,
                background: s.active ? `${s.color}15` : 'rgba(15,23,42,0.4)',
                border: `1px solid ${s.active ? `${s.color}40` : 'transparent'}`
              }}>
                <span className="status-dot" style={{ background: s.color, animation: s.active ? 'pulse-amber 1.5s infinite' : 'none', opacity: s.active ? 1 : 0.3 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.active ? s.color : '#475569' }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{s.sub}</div>
                </div>
                {s.active && <span style={{ marginLeft: 'auto', fontSize: 9, color: s.color, fontWeight: 700 }}>ACTIVE</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && <AlertDetailModal alert={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
