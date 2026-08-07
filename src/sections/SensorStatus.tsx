import { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { SENSOR_SPECS } from '../data/mockData';

function Sparkline({ color = '#06b6d4' }: { color?: string }) {
  const pts = Array.from({ length: 20 }, (_, i) => ({ x: i, y: 40 + Math.sin(i * 0.5) * 15 + Math.random() * 10 }));
  const maxY = Math.max(...pts.map(p => p.y));
  const minY = Math.min(...pts.map(p => p.y));
  const norm = (v: number) => 50 - ((v - minY) / (maxY - minY)) * 40;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x / 19) * 100} ${norm(p.y)}`).join(' ');
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: '100%', height: 40 }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
      <path d={d + ' L 100 60 L 0 60 Z'} fill={`${color}15`} />
    </svg>
  );
}

function Waveform() {
  const bars = Array.from({ length: 32 }, (_, i) => ({
    h: 30 + Math.abs(Math.sin(i * 0.4)) * 40 + Math.random() * 20,
    delay: i * 0.03
  }));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 48 }}>
      {bars.map((b, i) => (
        <div key={i} style={{
          width: 3, background: `linear-gradient(to top, #22d3ee, #06b6d480)`,
          borderRadius: 2, animationDelay: `${b.delay}s`,
          animation: `wave-anim ${0.4 + Math.random() * 0.4}s ease-in-out ${b.delay}s infinite alternate`,
          height: `${b.h}%`
        }} />
      ))}
    </div>
  );
}

function MiniCompass({ heading = 327 }: { heading?: number }) {
  return (
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      <svg viewBox="0 0 80 80" style={{ width: 80, height: 80 }}>
        <circle cx="40" cy="40" r="36" fill="rgba(15,23,42,0.8)" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
        {['N','E','S','W'].map((d, i) => (
          <text key={d} x={40 + 28 * Math.sin(i * 90 * Math.PI / 180)} y={40 - 28 * Math.cos(i * 90 * Math.PI / 180) + 4}
            textAnchor="middle" style={{ fill: '#475569', fontSize: 8, fontFamily: 'JetBrains Mono' }}>{d}</text>
        ))}
        <line x1="40" y1="40" x2={40 + 22 * Math.sin(heading * Math.PI / 180)} y2={40 - 22 * Math.cos(heading * Math.PI / 180)}
          stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <line x1="40" y1="40" x2={40 - 14 * Math.sin(heading * Math.PI / 180)} y2={40 + 14 * Math.cos(heading * Math.PI / 180)}
          stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="40" r="3" fill="#22d3ee" />
      </svg>
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#22d3ee' }}>{heading}°</div>
    </div>
  );
}

function HealthRing({ value, color }: { value: number; color: string }) {
  const r = 22; const circ = 2 * Math.PI * r;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth="5" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${(value / 100) * circ} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 28 28)" style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
      <text x="28" y="32" textAnchor="middle"
        style={{ fontFamily: 'JetBrains Mono', fill: '#e2e8f0', fontSize: 9, fontWeight: 700 }}>{value}%</text>
    </svg>
  );
}

function DiagModal({ sensor, onClose }: { sensor: typeof SENSOR_SPECS.radar; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, color: '#e2e8f0' }}>🔬 Diagnostics — {sensor.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['Firmware Version', sensor.firmware, '#06b6d4'],
            ['Signal Strength', `${sensor.signal} dBm`, sensor.signal > -70 ? '#10b981' : '#f59e0b'],
            ['Operating Temperature', `${sensor.temp}°C`, sensor.temp < 60 ? '#10b981' : '#ef4444'],
            ['Health Score', `${sensor.health}%`, '#10b981'],
            ['Range / Resolution', sensor.range, '#94a3b8'],
            ['Sample Rate', sensor.detectRate, '#94a3b8'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{l}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: c, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(6,182,212,0.06)', borderRadius: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
            {sensor.description}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SensorStatus() {
  const { addToast } = useToast();
  const [diagSensor, setDiagSensor] = useState<null | keyof typeof SENSOR_SPECS>(null);
  const [scanning, setScanning] = useState(false);

  const runDiag = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      addToast('✅ All Systems Nominal — Full Diagnostic Complete', 'success');
    }, 3000);
  };

  const healthColor = (h: number) => h >= 90 ? '#10b981' : h >= 75 ? '#f59e0b' : '#ef4444';

  const CARDS = [
    {
      key: 'radar' as const,
      title: '📡 77 GHz MMW Radar',
      subtitle: 'Long-Range Obstacle Detection',
      extra: (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Signal Level (Live)</div>
          <Sparkline color="#06b6d4" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#94a3b8' }}>Range: {SENSOR_SPECS.radar.range}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#10b981' }}>{SENSOR_SPECS.radar.detectRate}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'thermal' as const,
      title: '🌡️ PTZ Thermal / IR Camera',
      subtitle: 'Fog & Night-Time Confirmation',
      extra: (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Thermal Temp (°C) — Live</div>
          <Sparkline color="#f59e0b" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#94a3b8' }}>8–14 μm LWIR</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#f59e0b' }}>{SENSOR_SPECS.thermal.detectRate}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'laser' as const,
      title: '🔦 Dual-Stage Laser System',
      subtitle: 'Rail Geometry & Crack Profiling',
      extra: (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Return Waveform (Live)</div>
          <Waveform />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#94a3b8' }}>Res: {SENSOR_SPECS.laser.range}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#10b981' }}>{SENSOR_SPECS.laser.detectRate}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'imu' as const,
      title: '🛰️ IMU + GNSS / GPS',
      subtitle: 'Curve Awareness & Geo-Tagging',
      extra: (
        <div style={{ marginTop: 8, display: 'flex', gap: 16, alignItems: 'center' }}>
          <MiniCompass heading={327} />
          <div style={{ flex: 1 }}>
            {[['Lat', '18.5204° N'], ['Lon', '73.8567° E'], ['Alt', '559 m'], ['Heading', '327°']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: '#475569' }}>{l}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#22d3ee' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="section-content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 15, color: '#e2e8f0', fontWeight: 700 }}>Sensor Array — Onboard Monitoring Suite</h2>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>4-sensor fusion · Real-time health monitoring · Last sync: {new Date().toLocaleTimeString()}</p>
        </div>
        <button className="btn-primary" onClick={runDiag} disabled={scanning} style={{ opacity: scanning ? 0.7 : 1 }}>
          {scanning ? '🔄 Scanning...' : '🔬 Run Full Diagnostic'}
        </button>
      </div>

      {/* 2×2 Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {CARDS.map(card => {
          const spec = SENSOR_SPECS[card.key];
          return (
            <div key={card.key} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{card.title}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{card.subtitle}</div>
                </div>
                <HealthRing value={spec.health} color={healthColor(spec.health)} />
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span className="badge badge-success">NOMINAL</span>
                <span style={{ fontSize: 11, color: '#475569' }}>Cal: {spec.lastCal.split(' ')[0]}</span>
              </div>

              {card.extra}

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(30,41,59,0.6)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => setDiagSensor(card.key)} style={{ fontSize: 11, padding: '5px 12px' }}>
                  🔬 Diagnostics
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {diagSensor && <DiagModal sensor={SENSOR_SPECS[diagSensor]} onClose={() => setDiagSensor(null)} />}
    </div>
  );
}
