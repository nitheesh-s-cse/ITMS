export default function Roadmap() {
  const PHASES = [
    {
      num: '01', label: 'PILOT', title: 'Pilot Deployment',
      period: 'Months 1–12',
      color: '#06b6d4',
      trains: 10,
      milestones: [
        '10-train pilot on high-risk routes (mountain & fog-prone zones)',
        'YOLOv8 model trained on India-specific obstacle classes',
        'Real-world data collection: 50,000+ detection events',
        'RDSO preliminary evaluation & safety certification application',
        'Baseline performance: mAP, response time, false-positive rate',
      ],
      kpis: [{ l: 'Trains', v: '10' }, { l: 'Routes', v: '3' }, { l: 'Data Events', v: '50K+' }]
    },
    {
      num: '02', label: 'VALIDATION', title: 'Field Validation & Certification',
      period: 'Months 12–24',
      color: '#f59e0b',
      trains: 100,
      milestones: [
        'Expand to 100 trains across 2 zonal railways',
        'RDSO type-approval & IEC 62280 cybersecurity compliance',
        'Integration with KAVACH on-board unit (advisory layer)',
        'Model fine-tuning via federated learning from fleet data',
        'AMC pricing finalized; MOU with 2 MSME fabricators signed',
      ],
      kpis: [{ l: 'Trains', v: '100' }, { l: 'Zones', v: '2' }, { l: 'Model Ver', v: 'v3.x' }]
    },
    {
      num: '03', label: 'ROLLOUT', title: 'Phased Zonal Rollout',
      period: 'Months 24–60',
      color: '#10b981',
      trains: 5000,
      milestones: [
        'Phased deployment across all 18 Indian Railways zones',
        'National Track Health Database operational (see below)',
        'Predictive analytics SaaS tier launched for zonal railways',
        'Export readiness: SAARC rail networks (Bangladesh, Sri Lanka)',
        'Target: 5,000+ locomotives equipped by Year 5',
      ],
      kpis: [{ l: 'Trains', v: '5,000+' }, { l: 'Zones', v: '18' }, { l: 'Revenue', v: 'ARR ₹XX Cr' }]
    },
  ];

  const DB_CARDS = [
    { icon: '📉', title: 'Predictive Analytics', color: '#8b5cf6', desc: 'Degradation trend modelling using accumulated sensor data — forecast failures 30–90 days ahead, enabling proactive replacement.' },
    { icon: '🗓️', title: 'Maintenance Planning', color: '#06b6d4', desc: 'Section-wise maintenance scheduling optimised by defect severity, traffic load, and historical failure patterns. Reduces mean-time-to-repair by ~35%.' },
    { icon: '📊', title: 'Performance Reports', color: '#10b981', desc: 'Automated zonal safety reporting, audit trail for RDSO and Railway Board compliance, and real-time SLA dashboards.' },
  ];

  return (
    <div className="section-content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: 20, borderLeft: '3px solid #06b6d4' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>🧭 Scalability & Growth Roadmap</h2>
        <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>
          Three-phase deployment strategy from pilot to national coverage — building toward a centralised
          National Track Health Database that transforms real-world operational data into a strategic asset
          for Indian Railways.
        </p>
      </div>

      {/* Phase Timeline — horizontal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
        {PHASES.map((ph, idx) => (
          <div key={ph.num} style={{ position: 'relative' }}>
            {/* Connector line */}
            {idx < 2 && (
              <div style={{
                position: 'absolute', top: 32, right: 0, width: '50%', height: 2,
                background: `linear-gradient(90deg, ${ph.color}60, transparent)`, zIndex: 1
              }} />
            )}
            {idx > 0 && (
              <div style={{
                position: 'absolute', top: 32, left: 0, width: '50%', height: 2,
                background: `linear-gradient(90deg, transparent, ${ph.color}60)`, zIndex: 1
              }} />
            )}

            <div className="glass-card" style={{ margin: '0 8px', padding: 20, borderTop: `3px solid ${ph.color}` }}>
              {/* Phase badge */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: `${ph.color}20`, border: `2px solid ${ph.color}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 800, color: ph.color
                }}>{ph.num}</div>
                <div>
                  <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: '1px' }}>PHASE {ph.num} — {ph.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{ph.title}</div>
                </div>
              </div>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14,
                background: `${ph.color}10`, border: `1px solid ${ph.color}30`,
                borderRadius: 20, padding: '3px 10px', fontSize: 10, color: ph.color, fontWeight: 600
              }}>📅 {ph.period}</div>

              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                {ph.kpis.map(k => (
                  <div key={k.l} style={{ background: `${ph.color}08`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: ph.color }}>{k.v}</div>
                    <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{k.l}</div>
                  </div>
                ))}
              </div>

              {/* Milestones */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {ph.milestones.map((m, i) => (
                  <li key={i} style={{ display: 'flex', gap: 7, fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                    <span style={{ color: ph.color, flexShrink: 0, fontWeight: 700 }}>›</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* National Track Health DB */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🗄️</span> National Track Health Database
          <span style={{ fontSize: 10, color: '#475569', fontWeight: 400, marginLeft: 4 }}>Phase 3 strategic asset</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {DB_CARDS.map(c => (
            <div key={c.title} className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.color, marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sustainability note */}
      <div className="glass-card" style={{ padding: 20, borderLeft: '3px solid #10b981', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>♻️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>AMC-Based Recurring Revenue Model</div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>
            The Annual Maintenance Contract model ensures sustainable, predictable revenue while creating strong
            retention incentives. As each locomotive accumulates operational data, the AI model improves via
            continual learning — increasing accuracy, reducing false positives, and delivering greater value
            per contract renewal. This compounding data-advantage creates a defensible moat against future competition.
          </div>
        </div>
      </div>
    </div>
  );
}
