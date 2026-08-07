import { useState, useEffect } from 'react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  alertCount: number;
  onAlertClick: () => void;
}

export default function Topbar({ title, subtitle, alertCount, onAlertClick }: TopbarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = time.toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  return (
    <div className="topbar">
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Live clock */}
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#06b6d4',
          background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)',
          padding: '4px 10px', borderRadius: 6
        }}>{fmt}</div>

        {/* MQTT chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          padding: '3px 8px', borderRadius: 6, fontSize: 10, color: '#10b981', fontWeight: 600
        }}>
          <span className="status-dot green" style={{ width: 5, height: 5 }} />
          MQTT TLS
        </div>

        {/* Bell */}
        <button onClick={onAlertClick} style={{
          position: 'relative', background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, width: 36, height: 36, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: alertCount > 0 ? '#ef4444' : '#475569', fontSize: 16
        }}>
          🔔
          {alertCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: '#fff', borderRadius: '50%',
              width: 16, height: 16, fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{alertCount}</span>
          )}
        </button>

        {/* Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #06b6d4, #0e7490)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
          border: '2px solid rgba(6,182,212,0.3)',
          cursor: 'pointer'
        }}>
          SY
        </div>
      </div>
    </div>
  );
}
