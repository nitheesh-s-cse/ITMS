import { useState, useEffect, useRef, useCallback } from 'react';
import { ToastProvider } from './hooks/useToast';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './sections/Dashboard';
import LiveMonitoring from './sections/LiveMonitoring';
import SensorStatus from './sections/SensorStatus';
import AIDetection from './sections/AIDetection';
import Alerts from './sections/Alerts';
import TrackHealth from './sections/TrackHealth';
import Analytics from './sections/Analytics';
import Maintenance from './sections/Maintenance';
import Reports from './sections/Reports';
import Business from './sections/Business';
import Roadmap from './sections/Roadmap';
import Settings from './sections/Settings';
import { ALERTS_DATA } from './data/mockData';

// ─── Types ───────────────────────────────────────────────
interface DetectionEntry {
  ts: string;
  cls: string;
  conf: number;
  id: number;
}

interface LiveStats {
  trackScanned: number;
  activeAlerts: number;
  uptime: number;
  accuracy: number;
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard:   { title: '🏠 Dashboard', subtitle: 'Real-time overview — RAILGUARD ITMS v2.0' },
  live:        { title: '🚆 Live Monitoring', subtitle: 'MJPEG stream · YOLOv8 inference · Real-time detection feed' },
  sensors:     { title: '📡 Sensor Status', subtitle: '77GHz Radar · Thermal Camera · Laser · IMU/GNSS' },
  ai:          { title: '🧠 AI Detection', subtitle: 'Edge Intelligence Layer · YOLOv8 · NVIDIA Jetson Orin' },
  alerts:      { title: '⚠️ Alerts', subtitle: 'Safety Decision Layer · Caution / Slow / Stop state machine' },
  trackhealth: { title: '🗺️ Track Health', subtitle: 'Route map · Segment analysis · 30-day health trend' },
  analytics:   { title: '📊 Analytics', subtitle: 'Detections · Uptime · Response time · System efficiency' },
  maintenance: { title: '🛠️ Maintenance', subtitle: 'Component health · Scheduled maintenance · History log' },
  reports:     { title: '📄 Reports', subtitle: 'Generate · Preview · Export safety & incident reports' },
  business:    { title: '💰 Business & Impact', subtitle: 'B2G model · Competitive matrix · Social & economic impact' },
  roadmap:     { title: '🧭 Scalability Roadmap', subtitle: 'Phase 1 → 2 → 3 · National Track Health Database' },
  settings:    { title: '⚙️ Settings', subtitle: 'Camera · Alerts · Detection sensitivity · System info' },
};

// ─── Socket.IO loader (optional) ─────────────────────────
let socketIOLoaded = false;
function loadSocketIO(cb: () => void) {
  if (socketIOLoaded) { cb(); return; }
  const s = document.createElement('script');
  s.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
  s.onload = () => { socketIOLoaded = true; cb(); };
  s.onerror = () => console.warn('[RAILGUARD] Socket.IO CDN not reachable');
  document.head.appendChild(s);
}

// ─── Web Audio beep ───────────────────────────────────────
let audioCtx: AudioContext | null = null;
function beep() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start(); osc.stop(audioCtx.currentTime + 0.4);
  } catch { /* silent */ }
}

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [systemOnline, setSystemOnline] = useState(false); // false until backend connects
  const [cameraOnline, setCameraOnline] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // Live data
  const [liveStats, setLiveStats] = useState<LiveStats>({
    trackScanned: 287, activeAlerts: 2, uptime: 99.97, accuracy: 98.3
  });
  const [detectionFeed, setDetectionFeed] = useState<DetectionEntry[]>([]);
  const [alertBanner, setAlertBanner] = useState<{ visible: boolean; data: any }>({ visible: false, data: null });
  const [liveAlerts, setLiveAlerts] = useState(ALERTS_DATA);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Unlock audio on first interaction
  useEffect(() => {
    const unlock = () => {
      setUserInteracted(true);
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('click', unlock);
    return () => document.removeEventListener('click', unlock);
  }, []);

  // ─── Socket.IO Connection ─────────────────────────────
  useEffect(() => {
    loadSocketIO(() => {
      try {
        const io = (window as any).io;
        if (!io) return;
        const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'], timeout: 5000 });

        socket.on('connect', () => {
          setSystemOnline(true);
          console.log('[RAILGUARD] Backend connected');
        });
        socket.on('disconnect', () => {
          setSystemOnline(false);
          setCameraOnline(false);
        });

        // KPI stats
        socket.on('stats_update', (data: Partial<LiveStats>) => {
          setLiveStats(prev => ({ ...prev, ...data }));
        });

        // Heartbeat
        socket.on('heartbeat', () => setSystemOnline(true));

        // Camera status
        socket.on('camera_status', (data: { online: boolean }) => {
          setCameraOnline(data.online);
        });

        // Detection event
        socket.on('detection_event', (data: { class: string; confidence: number; km?: string }) => {
          const entry: DetectionEntry = {
            ts: new Date().toLocaleTimeString('en-IN', { hour12: false }),
            cls: data.class,
            conf: data.confidence,
            id: Date.now(),
          };
          setDetectionFeed(prev => [entry, ...prev].slice(0, 20));
        });

        // Alert
        socket.on('new_alert', (data: any) => {
          // Update stats
          setLiveStats(prev => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }));

          // Show banner
          if (bannerTimer.current) clearTimeout(bannerTimer.current);
          setAlertBanner({ visible: true, data });
          bannerTimer.current = setTimeout(() => setAlertBanner({ visible: false, data: null }), 6000);

          // Sound
          if (soundEnabled && userInteracted) beep();

          // Add to alert list
          const newAlert = {
            id: `ALT-${Math.floor(Math.random() * 9000 + 1000)}`,
            ts: new Date().toLocaleTimeString('en-IN', { hour12: false }),
            type: data.type || 'Obstacle',
            object: data.class || 'Unknown',
            confidence: data.confidence || 85,
            km: data.km || '—',
            severity: data.confidence >= 90 ? 'CRITICAL' : 'HIGH',
            status: 'Active',
            priority: 1,
          };
          setLiveAlerts(prev => [newAlert, ...prev].slice(0, 50));
        });

        return () => socket.disconnect();
      } catch (err) {
        console.warn('[RAILGUARD] Socket connection failed:', err);
      }
    });
  }, [soundEnabled, userInteracted]);

  const navigateTo = useCallback((section: string) => {
    setActiveSection(section);
  }, []);

  const activeCount = liveAlerts.filter(a => a.status === 'Active').length;
  const { title, subtitle } = SECTION_TITLES[activeSection] || { title: activeSection, subtitle: '' };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':   return <Dashboard liveStats={liveStats} />;
      case 'live':        return <LiveMonitoring detectionFeed={detectionFeed} alertBanner={alertBanner} cameraOnline={cameraOnline} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />;
      case 'sensors':     return <SensorStatus />;
      case 'ai':          return <AIDetection />;
      case 'alerts':      return <Alerts liveAlerts={liveAlerts} />;
      case 'trackhealth': return <TrackHealth />;
      case 'analytics':   return <Analytics />;
      case 'maintenance': return <Maintenance />;
      case 'reports':     return <Reports />;
      case 'business':    return <Business />;
      case 'roadmap':     return <Roadmap />;
      case 'settings':    return <Settings />;
      default:            return <Dashboard liveStats={liveStats} />;
    }
  };

  return (
    <ToastProvider>
      {/* Blueprint grid overlay */}
      <div className="blueprint-grid" />

      {/* Layout */}
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Sidebar
          active={activeSection}
          setActive={navigateTo}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          systemOnline={systemOnline}
          alertCount={activeCount}
        />

        {/* Main content */}
        <main
          className="main-content"
          style={{
            marginLeft: collapsed ? 64 : 260,
            flex: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-left 0.3s ease',
            overflow: 'hidden',
          }}
        >
          <Topbar
            title={title}
            subtitle={subtitle}
            alertCount={activeCount}
            onAlertClick={() => navigateTo('alerts')}
          />
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {renderSection()}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
