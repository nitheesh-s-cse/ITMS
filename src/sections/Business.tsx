import { COMPETITIVE_MATRIX } from '../data/mockData';

export default function Business() {
  const IMPACT = [
    {
      icon: '🛡️', title: 'Social Impact',
      color: '#06b6d4',
      points: [
        'Prevents derailments — protects hundreds of passengers per incident',
        'Real-time alerts protect train crew & lineside workers',
        'Reduces level-crossing casualties through advance detection',
        'Improves public confidence in rail safety infrastructure',
      ]
    },
    {
      icon: '💹', title: 'Economic Impact',
      color: '#10b981',
      points: [
        'Targets ₹1,000–5,000 Cr/year in safety-disruption losses (IR estimate)',
        'Reduces accident-linked delay costs (avg ₹2–8 Cr per major incident)',
        'Predictive maintenance cuts unplanned downtime by ~40%',
        'Hardware + AMC model ensures sustainable recurring revenue',
      ]
    },
    {
      icon: '🏭', title: 'MSME & Livelihood',
      color: '#f59e0b',
      points: [
        'Indigenous fabrication of sensor mounts & enclosures (MSME units)',
        'Annual Maintenance Contracts create local skilled employment',
        'Technology transfer via MSME sub-contracting partnerships',
        'Aligns with Make-in-India & AatmaNirbhar Bharat mandate',
      ]
    },
  ];

  const MANDATE = [
    { label: 'Novel Idea', desc: 'First edge-AI multi-sensor fusion system for Indian rail geometry + obstacle in one unit' },
    { label: 'Cost Saving', desc: 'Hardware + AMC significantly below imported ETCS/TPWS equivalents' },
    { label: 'Quality of Life', desc: 'Safer railways for passengers, crew and communities near tracks' },
    { label: 'Climate Mitigation', desc: 'Predictive maintenance reduces material waste; rail shift from road reduces emissions' },
  ];

  return (
    <div className="section-content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Business Model */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>💰 Business Model</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { icon: '🏛️', label: 'Primary Customer', val: 'B2G — Indian Railways (Ministry of Railways)', color: '#06b6d4' },
            { icon: '🔧', label: 'Revenue Stream 1', val: 'Hardware Deployment (per locomotive/consist)', color: '#10b981' },
            { icon: '📋', label: 'Revenue Stream 2', val: 'Annual Maintenance Contract (AMC)', color: '#f59e0b' },
            { icon: '📊', label: 'Revenue Stream 3', val: 'Predictive Analytics SaaS (Upsell)', color: '#8b5cf6' },
          ].map(b => (
            <div key={b.label} style={{
              background: `${b.color}08`, border: `1px solid ${b.color}20`,
              borderRadius: 10, padding: '14px 16px'
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{b.icon}</div>
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{b.label}</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4 }}>{b.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Matrix */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(6,182,212,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>⚔️ Competitive Advantage Matrix</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#10b981' }}>✅</span><span style={{ fontSize: 11, color: '#94a3b8' }}>RailGuard ITMS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#ef4444' }}>❌</span><span style={{ fontSize: 11, color: '#94a3b8' }}>Existing Systems</span>
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature / Capability</th>
                <th style={{ textAlign: 'center' }}>RAILGUARD ITMS</th>
                <th style={{ textAlign: 'center' }}>Existing Systems</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITIVE_MATRIX.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 13, color: '#e2e8f0' }}>{row.feature}</td>
                  <td style={{ textAlign: 'center', fontSize: 16 }}>{row.railguard ? '✅' : '❌'}</td>
                  <td style={{ textAlign: 'center', fontSize: 16 }}>{row.existing ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {IMPACT.map(imp => (
          <div key={imp.title} className="glass-card" style={{ padding: 20, borderTop: `2px solid ${imp.color}` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 24 }}>{imp.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{imp.title}</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {imp.points.map((p, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  <span style={{ color: imp.color, flexShrink: 0, marginTop: 1 }}>›</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Mandate Badges */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>🎯 MSME Hackathon Mandate Fit</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {MANDATE.map(m => (
            <div key={m.label} style={{
              display: 'flex', gap: 12, padding: '12px 14px',
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 10, alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>✅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 3 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
