

const NAV_ITEMS = [
  { id: 'dashboard',   icon: '🏠', label: 'Dashboard' },
  { id: 'live',        icon: '🚆', label: 'Live Monitoring' },
  { id: 'sensors',     icon: '📡', label: 'Sensor Status' },
  { id: 'ai',          icon: '🧠', label: 'AI Detection' },
  { id: 'alerts',      icon: '⚠️', label: 'Alerts' },
  { id: 'trackhealth', icon: '🗺️', label: 'Track Health' },
  { id: 'analytics',   icon: '📊', label: 'Analytics' },
  { id: 'maintenance', icon: '🛠️', label: 'Maintenance' },
  { id: 'reports',     icon: '📄', label: 'Reports' },
  { id: 'business',    icon: '💰', label: 'Business & Impact' },
  { id: 'roadmap',     icon: '🧭', label: 'Scalability Roadmap' },
  { id: 'settings',    icon: '⚙️', label: 'Settings' },
];

interface SidebarProps {
  active: string;
  setActive: (id: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  systemOnline: boolean;
  alertCount: number;
}

export default function Sidebar({ active, setActive, collapsed, setCollapsed, systemOnline, alertCount }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(6,182,212,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #06b6d4, #0e7490)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6,182,212,0.4)',
            fontSize: 18
          }}>🚆</div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#22d3ee', lineHeight: 1.2 }}>RAILGUARD ITMS</div>
              <div style={{ fontSize: 10, color: '#475569', letterSpacing: '1px', fontWeight: 500 }}>v2.0 COMMAND CENTER</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 14, padding: 4, flexShrink: 0 }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`sidebar-nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => setActive(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && (
              <span style={{ flex: 1 }}>{item.label}</span>
            )}
            {!collapsed && item.id === 'alerts' && alertCount > 0 && (
              <span style={{
                background: '#ef4444', color: '#fff', borderRadius: '50%',
                width: 18, height: 18, fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>{alertCount}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(6,182,212,0.08)' }}>
        {/* System status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span className={`status-dot ${systemOnline ? 'green' : 'red'}`} />
          {!collapsed && (
            <span style={{ fontSize: 11, color: systemOnline ? '#10b981' : '#ef4444', fontWeight: 600 }}>
              {systemOnline ? 'System Online' : 'System Offline'}
            </span>
          )}
        </div>
        {!collapsed && (
          <div style={{
            background: 'rgba(6,182,212,0.06)',
            border: '1px solid rgba(6,182,212,0.12)',
            borderRadius: 8, padding: '6px 10px',
            fontSize: 10, color: '#475569', fontWeight: 600,
            letterSpacing: '0.5px', textAlign: 'center'
          }}>
            🛰️ BUILT BY NEXUS
          </div>
        )}
      </div>
    </aside>
  );
}
