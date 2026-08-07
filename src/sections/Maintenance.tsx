import { useState } from 'react';
import { MAINTENANCE_UPCOMING, MAINTENANCE_HISTORY } from '../data/mockData';
import { useToast } from '../hooks/useToast';

const priorityColor = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#06b6d4' } as Record<string, string>;
const statusColor = { Scheduled: '#06b6d4', Pending: '#f59e0b', Completed: '#10b981' } as Record<string, string>;

function ScheduleModal({ onClose, onAdd }: { onClose: () => void; onAdd: (item: any) => void }) {
  const [form, setForm] = useState({ component: '', type: '', due: '', priority: 'MEDIUM', technician: '' });
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, color: '#e2e8f0' }}>🛠️ Schedule New Maintenance</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Component', key: 'component', placeholder: 'e.g., Radar Array Unit B' },
            { label: 'Work Type', key: 'type', placeholder: 'e.g., Calibration' },
            { label: 'Due Date', key: 'due', type: 'date' },
            { label: 'Technician / Team', key: 'technician', placeholder: 'e.g., Field Unit 1' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input type={f.type || 'text'} className="input-field" placeholder={f.placeholder}
                value={(form as any)[f.key]} onChange={e => upd(f.key, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Priority</label>
            <select className="input-field" value={form.priority} onChange={e => upd('priority', e.target.value)}>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn-success" onClick={() => { onAdd(form); onClose(); }}>💾 Schedule</button>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(30,41,59,0.8)', color: '#475569', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Maintenance() {
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [upcoming, setUpcoming] = useState(MAINTENANCE_UPCOMING);

  const componentHealth = [
    { name: '77GHz Radar', health: 98, color: '#10b981' },
    { name: 'Thermal Camera', health: 95, color: '#10b981' },
    { name: 'Laser System', health: 91, color: '#f59e0b' },
    { name: 'IMU/GNSS', health: 99, color: '#10b981' },
    { name: 'Mounting Hardware', health: 84, color: '#f59e0b' },
    { name: 'Edge AI (Jetson)', health: 97, color: '#10b981' },
  ];

  const addItem = (form: any) => {
    const newItem = {
      id: `MNT-${String(92 + upcoming.length).padStart(3, '0')}`,
      component: form.component || 'Unknown Component',
      type: form.type || 'General Maintenance',
      due: form.due || '2025-02-01',
      priority: form.priority,
      technician: form.technician || 'Unassigned',
      status: 'Scheduled'
    };
    setUpcoming(prev => [newItem, ...prev]);
    addToast(`🛠️ Maintenance scheduled: ${newItem.id}`, 'success');
  };

  return (
    <div className="section-content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 15, color: '#e2e8f0', fontWeight: 700 }}>Predictive Maintenance Center</h2>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Component health tracking · Scheduled work orders</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Schedule Maintenance</button>
      </div>

      {/* Component Health Bars */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 16 }}>🔧 Component Health</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {componentHealth.map(c => (
            <div key={c.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.name}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: c.color, fontWeight: 700 }}>{c.health}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${c.health}%`, background: `linear-gradient(90deg, ${c.color}80, ${c.color})` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming cards */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>📅 Upcoming Maintenance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {upcoming.map(m => (
            <div key={m.id} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${priorityColor[m.priority] || '#475569'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#475569' }}>{m.id}</span>
                <span className={`badge badge-${m.priority === 'HIGH' ? 'critical' : m.priority === 'MEDIUM' ? 'warning' : 'info'}`} style={{ fontSize: 9 }}>{m.priority}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{m.component}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>{m.type}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, color: '#475569' }}>Due: <span style={{ color: '#22d3ee', fontFamily: 'JetBrains Mono, monospace' }}>{m.due}</span></div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>👤 {m.technician}</div>
                </div>
                <span style={{ fontSize: 11, color: statusColor[m.status] || '#475569', fontWeight: 600 }}>● {m.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(6,182,212,0.1)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
          📋 Maintenance History
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Component</th>
                <th>Work Type</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Technician</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MAINTENANCE_HISTORY.map(h => (
                <tr key={h.id}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8' }}>{h.id}</td>
                  <td style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{h.component}</td>
                  <td style={{ fontSize: 12 }}>{h.type}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8' }}>{h.date}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#22d3ee' }}>{h.duration}</td>
                  <td style={{ fontSize: 11 }}>{h.technician}</td>
                  <td><span className="badge badge-success" style={{ fontSize: 9 }}>{h.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <ScheduleModal onClose={() => setShowModal(false)} onAdd={addItem} />}
    </div>
  );
}
