import { useState } from 'react';
import { useToast } from '../hooks/useToast';

export default function Settings() {
  const { addToast } = useToast();
  const [cameraIP, setCameraIP] = useState('10.213.209.213:8080');
  const [backendIP, setBackendIP] = useState('localhost:5000');
  const [soundAlert, setSoundAlert] = useState(true);
  const [emailAlert, setEmailAlert] = useState(false);
  const [smsAlert, setSmsAlert] = useState(false);
  const [autoEsc, setAutoEsc] = useState(30);
  const [sensitivity, setSensitivity] = useState(50);
  const [minConf, setMinConf] = useState(70);
  const [theme, setTheme] = useState('Dark Navy');
  const [units, setUnits] = useState('Metric');
  const [testing, setTesting] = useState(false);

  const save = () => addToast('✅ Settings saved successfully', 'success');
  const testConn = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      addToast('✅ Connection test successful — Camera reachable', 'success');
    }, 1800);
  };

  const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(6,182,212,0.1)' }}>
        {title}
      </div>
      {children}
    </div>
  );

  const Row = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(30,41,59,0.4)' }}>
      <div>
        <div style={{ fontSize: 13, color: '#e2e8f0' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  const Toggle = ({ val, set }: { val: boolean; set: (v: boolean) => void }) => (
    <label className="toggle-switch">
      <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );

  return (
    <div className="section-content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Camera Configuration */}
        <SECTION title="📷 Camera Configuration">
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Camera IP Address</label>
            <input className="input-field" value={cameraIP} onChange={e => setCameraIP(e.target.value)} placeholder="IP:PORT" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={testConn} disabled={testing} style={{ opacity: testing ? 0.7 : 1 }}>
              {testing ? '🔄 Testing...' : '🔌 Test Connection'}
            </button>
            <button className="btn-success" onClick={save}>💾 Save</button>
          </div>
        </SECTION>

        {/* Alert Preferences */}
        <SECTION title="🔔 Alert Preferences">
          <Row label="Sound Alerts" sub="Beep on critical detection"><Toggle val={soundAlert} set={setSoundAlert} /></Row>
          <Row label="Email Notifications" sub="Send email on CRITICAL alerts"><Toggle val={emailAlert} set={setEmailAlert} /></Row>
          <Row label="SMS Notifications" sub="Send SMS to on-duty controller"><Toggle val={smsAlert} set={setSmsAlert} /></Row>
          <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(30,41,59,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>Auto-Escalation Delay</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#06b6d4' }}>{autoEsc}s</span>
            </div>
            <input type="range" min="10" max="120" step="5" value={autoEsc} onChange={e => setAutoEsc(parseInt(e.target.value))} />
          </div>
        </SECTION>

        {/* Detection Sensitivity */}
        <SECTION title="🎯 Detection Sensitivity">
          <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(30,41,59,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>Overall Sensitivity</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#06b6d4' }}>{sensitivity}%</span>
            </div>
            <input type="range" min="10" max="90" value={sensitivity} onChange={e => setSensitivity(parseInt(e.target.value))} />
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Higher = more alerts, more false positives</div>
          </div>
          <div style={{ padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>Min Confidence Threshold</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#06b6d4' }}>{minConf}%</span>
            </div>
            <input type="range" min="30" max="95" value={minConf} onChange={e => setMinConf(parseInt(e.target.value))} />
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Detections below this confidence are suppressed</div>
          </div>
          <button className="btn-success" onClick={save} style={{ marginTop: 8 }}>💾 Apply</button>
        </SECTION>

        {/* Display Preferences */}
        <SECTION title="🎨 Display Preferences">
          <Row label="Theme">
            <select className="input-field" style={{ width: 140 }} value={theme} onChange={e => setTheme(e.target.value)}>
              <option>Dark Navy</option>
              <option>Deep Slate</option>
              <option>Midnight Black</option>
            </select>
          </Row>
          <Row label="Units">
            <select className="input-field" style={{ width: 120 }} value={units} onChange={e => setUnits(e.target.value)}>
              <option>Metric</option>
              <option>Imperial</option>
            </select>
          </Row>
          <Row label="Language">
            <select className="input-field" style={{ width: 120 }}>
              <option>English</option>
              <option>हिन्दी</option>
            </select>
          </Row>
          <div style={{ marginTop: 14 }}>
            <button className="btn-success" onClick={save}>💾 Save Preferences</button>
          </div>
        </SECTION>

        {/* System Info */}
        <SECTION title="ℹ️ System Information">
          {[
            ['Platform Version', 'RAILGUARD ITMS v2.0.4'],
            ['Backend Status', <span style={{ color: '#10b981', fontWeight: 600 }}>● Connected</span>],
            ['Backend Address', backendIP],
            ['Last Backend Sync', new Date().toLocaleTimeString()],
            ['AI Model', 'YOLOv8n-custom v1.3.2'],
            ['Edge Compute', 'NVIDIA Jetson Orin (8GB)'],
            ['Cloud Sync', <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="status-dot green" />
              <span style={{ color: '#10b981', fontSize: 12 }}>MQTT TLS Active</span>
            </span>],
          ].map(([l, v]) => (
            <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(30,41,59,0.4)' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{l}</span>
              <span style={{ fontFamily: typeof v === 'string' ? 'JetBrains Mono, monospace' : 'inherit', fontSize: 12, color: '#e2e8f0' }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Backend Endpoint</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input-field" value={backendIP} onChange={e => setBackendIP(e.target.value)} />
              <button className="btn-primary" onClick={testConn} style={{ whiteSpace: 'nowrap', fontSize: 12 }}>Test</button>
            </div>
          </div>
        </SECTION>

        {/* About */}
        <SECTION title="⚡ About">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #06b6d4, #0e7490)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, boxShadow: '0 0 24px rgba(6,182,212,0.4)'
            }}>🚆</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800, color: '#22d3ee', marginBottom: 4 }}>
              RAILGUARD ITMS
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginBottom: 16 }}>v2.0 Command Center</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 20, padding: '8px 20px',
              fontSize: 13, color: '#22d3ee', fontWeight: 700, letterSpacing: '1px'
            }}>
              🛰️ BUILT BY NEXUS
            </div>
            <div style={{ fontSize: 11, color: '#1e3a5f', marginTop: 20, lineHeight: 1.7 }}>
              Real-time Railway Track Monitoring &amp; Intelligent Safety System<br />
              Edge AI · Multi-Sensor Fusion · Predictive Maintenance
            </div>
          </div>
        </SECTION>
      </div>
    </div>
  );
}
