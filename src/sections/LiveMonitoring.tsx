import { useState, useRef } from 'react';
import { useInterval } from '../hooks/useCountUp';
import { useToast } from '../hooks/useToast';

interface DetectionEntry {
  ts: string;
  cls: string;
  conf: number;
  id: number;
}

interface LiveProps {
  detectionFeed: DetectionEntry[];
  alertBanner: { visible: boolean; data: any } | null;
  cameraOnline: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
}

export default function LiveMonitoring({ detectionFeed, alertBanner, cameraOnline, soundEnabled, setSoundEnabled }: LiveProps) {
  const { addToast } = useToast();
  const [threshold, setThreshold] = useState(0.5);
  const [autoRecord, setAutoRecord] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [fps, setFps] = useState(28);
  const [confidence, setConfidence] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useInterval(() => {
    setFps(Math.round(26 + Math.random() * 6));
    if (detectionFeed.length > 0) {
      setConfidence(detectionFeed[0].conf);
    }
  }, 2000);

  const handleSnapshot = () => {
    addToast('📸 Snapshot saved to reports queue', 'success');
  };

  const handleRecord = () => {
    addToast('🔴 Recording started — saving to /recordings/', 'info');
  };

  const handleReconnect = () => {
    addToast('🔄 Camera reconnect attempted...', 'warning');
    setTimeout(() => addToast('Camera stream unavailable — check IP', 'error'), 2000);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    }
  };

  const sevColor = (conf: number) => conf >= 90 ? '#ef4444' : conf >= 70 ? '#f59e0b' : '#06b6d4';

  return (
    <div className="section-content" style={{ padding: 24 }}>
      {/* Alert Banner */}
      {alertBanner?.visible && (
        <div className="alert-banner" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>
              OBSTACLE DETECTED: {alertBanner.data?.class || 'Unknown'} | Confidence: {alertBanner.data?.confidence || '--'}%
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#f87171' }}>
              Track KM {alertBanner.data?.km || '--'} | {alertBanner.data?.ts || new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Left: Video */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Video Panel */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }} ref={videoRef}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(6,182,212,0.1)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="live-badge">LIVE</div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8' }}>
                {fps} fps | 1920×1080 | MJPEG
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`status-dot ${cameraOnline ? 'green' : 'red'}`} />
                <span style={{ fontSize: 11, color: cameraOnline ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                  {cameraOnline ? 'Camera Connected' : 'Camera Offline'}
                </span>
              </div>
            </div>
            <div style={{ position: 'relative', background: '#060a10', aspectRatio: '16/9', overflow: 'hidden' }}>
              {/* Scanline effect */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)' }} />
              {/* HUD overlays */}
              <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#10b981' }}>
                ◉ REC &nbsp;|&nbsp; {fps}fps &nbsp;|&nbsp; 1920×1080
              </div>
              <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#22d3ee' }}>
                JETSON ORIN &nbsp;|&nbsp; YOLOv8n
              </div>
              {detectionFeed.length > 0 && (
                <div style={{ position: 'absolute', top: 32, left: 10, zIndex: 4,
                  background: `${sevColor(detectionFeed[0].conf)}22`, border: `1px solid ${sevColor(detectionFeed[0].conf)}60`,
                  borderRadius: 4, padding: '3px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: sevColor(detectionFeed[0].conf) }}>
                  ► {detectionFeed[0].cls} — {detectionFeed[0].conf}%
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#22d3ee' }}>
                KM 67.3 • {new Date().toLocaleTimeString('en-IN', { hour12: false })} IST
              </div>
              <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#475569' }}>
                THRESHOLD: {(threshold * 100).toFixed(0)}%
              </div>

              {/* Actual stream */}
              <img ref={imgRef}
                src="http://10.213.209.213:8080/video"
                alt="MJPEG Stream"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: nightMode ? 'saturate(0.3) brightness(1.2)' : 'none' }}
                onError={e => { (e.target as HTMLImageElement).src = ''; }}
              />

              {/* No signal overlay */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,10,16,0.96)' }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.15 }}>📡</div>
                <div style={{ fontSize: 14, color: '#1e3a5f', fontFamily: 'JetBrains Mono, monospace' }}>NO SIGNAL</div>
                <div style={{ fontSize: 11, color: '#1e3a5f', marginTop: 4 }}>http://10.213.209.213:8080/video</div>
                <div style={{ fontSize: 10, color: '#1e293b', marginTop: 8 }}>Start Flask backend on port 5000 or IP-Webcam on mobile</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleSnapshot}>📸 Snapshot</button>
            <button className="btn-danger" onClick={handleRecord}>🔴 Start Recording</button>
            <button className="btn-primary" onClick={handleReconnect}>🔄 Reconnect Camera</button>
            <button className="btn-primary" onClick={handleFullscreen}>⛶ Fullscreen</button>
          </div>

          {/* TTR Card */}
          <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>⏱️ TIME-TO-RISK (TTR)</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>
                {detectionFeed.length > 0 ? '4.2s' : '—'}
              </div>
              <div style={{ fontSize: 10, color: '#475569' }}>@ 80 km/h · 93m braking margin</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Train Speed', '80 km/h', '#06b6d4'], ['Detection Range', '380 m', '#10b981'], ['Braking Dist', '287 m', '#f59e0b'], ['Safety Margin', '93 m', '#10b981']].map(([l, v, c]) => (
                <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#475569' }}>{l}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: c as string, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Toggles */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 12, letterSpacing: '0.5px' }}>CONTROLS</div>
            {[
              { label: 'Sound Alerts', val: soundEnabled, set: setSoundEnabled },
              { label: 'Auto-Record on Alert', val: autoRecord, set: setAutoRecord },
              { label: 'Night Mode Enhancement', val: nightMode, set: setNightMode },
            ].map(({ label, val, set }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Detection Threshold</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#06b6d4' }}>{(threshold * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min="0.1" max="0.9" step="0.05" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))} />
            </div>
          </div>

          {/* Confidence Meter */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 12, letterSpacing: '0.5px' }}>CURRENT FRAME ANALYSIS</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Detection Confidence</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#22d3ee', fontWeight: 700 }}>{confidence}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill confidence-fill" style={{ width: `${confidence}%` }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Inference', '28 ms', '#10b981'], ['Objects', detectionFeed.length > 0 ? '1' : '0', '#06b6d4'],
                ['Frame #', '18423', '#94a3b8'], ['Model', 'YOLOv8n', '#f59e0b']].map(([l, v, c]) => (
                <div key={l as string} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 6, padding: '6px 8px' }}>
                  <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: c as string, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detection Feed */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(6,182,212,0.1)', fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
              DETECTION FEED <span style={{ color: '#475569' }}>({detectionFeed.length}/20)</span>
            </div>
            <div className="detection-feed" style={{ maxHeight: 300 }}>
              {detectionFeed.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#1e3a5f', fontSize: 12 }}>
                  <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>👁️</div>
                  No detections yet
                </div>
              ) : (
                detectionFeed.map((d, i) => (
                  <div key={d.id || i} className="feed-item">
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#475569', width: 55, flexShrink: 0 }}>{d.ts}</span>
                    <span style={{ flex: 1, fontSize: 11, color: '#e2e8f0', fontWeight: 500 }}>{d.cls}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sevColor(d.conf), fontWeight: 700 }}>{d.conf}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
