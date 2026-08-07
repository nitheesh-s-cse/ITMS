import { useState } from 'react';
import { REPORTS_LIST } from '../data/mockData';
import { useToast } from '../hooks/useToast';

export default function Reports() {
  const { addToast } = useToast();
  const [reportType, setReportType] = useState('Daily Summary');
  const [dateFrom, setDateFrom] = useState('2025-01-14');
  const [dateTo, setDateTo] = useState('2025-01-14');
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState(REPORTS_LIST);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      const newRpt = {
        id: `RPT-00${45 + reports.length - 4}`,
        name: `${reportType} — ${dateFrom}`,
        type: reportType,
        generated: new Date().toISOString().slice(0, 16).replace('T', ' '),
        size: `${(0.5 + Math.random() * 4).toFixed(1)} MB`,
        status: 'Ready'
      };
      setReports(prev => [newRpt, ...prev]);
      addToast(`📄 Report generated: ${newRpt.id}`, 'success');
    }, 2200);
  };

  const sampleContent = `
RAILGUARD ITMS — DAILY SAFETY SUMMARY
Date: ${dateFrom} | Route: Full Network | Version: 2.0
═══════════════════════════════════════════════════════

EXECUTIVE SUMMARY
─────────────────
Total Track Scanned    : 287 km
Detection Events       : 49
Active Alerts          : 2
Resolved Incidents     : 8
System Uptime          : 99.97%
Detection Accuracy     : 98.3%

TOP INCIDENTS
─────────────
[10:31] ALT-0141 — CRITICAL — Person on Track @ KM 34.1 (Conf: 99%)
        Action: Emergency brake advisory issued. Section control notified.
        Resolution: Track cleared. Train resumed at reduced speed.

[10:48] ALT-0142 — HIGH — Cow on Track @ KM 67.3 (Conf: 96%)
        Action: Slow-zone advisory. Horn activated via relay.
        Resolution: Animal cleared within 40 seconds.

SENSOR STATUS
─────────────
77GHz Radar      : NOMINAL (98% health)
Thermal Camera   : NOMINAL (95% health)
Laser System     : NOMINAL (91% health)
IMU/GNSS         : NOMINAL (99% health)

Response Time (avg): 0.30s | Peak: 0.34s
─────────────────────────────────────────
Report ID: RPT-0044 | Generated: 2025-01-14 06:00
`;

  return (
    <div className="section-content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Generator */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>📄 Generate Report</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Report Type</label>
            <select className="input-field" value={reportType} onChange={e => setReportType(e.target.value)}>
              {['Daily Summary', 'Weekly Analysis', 'Incident Report', 'Maintenance Report'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>From Date</label>
            <input type="date" className="input-field" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>To Date</label>
            <input type="date" className="input-field" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
        <button className="btn-primary" onClick={generate} disabled={generating} style={{ opacity: generating ? 0.7 : 1 }}>
          {generating ? '⏳ Generating...' : '📥 Generate Report'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Report list */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(6,182,212,0.1)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
            📁 Recent Reports
          </div>
          {reports.map((r, i) => (
            <div key={r.id} style={{
              padding: '12px 16px', borderBottom: i < reports.length - 1 ? '1px solid rgba(30,41,59,0.5)' : 'none',
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'background 0.2s', cursor: 'pointer'
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(6,182,212,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 20 }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.id}</span> · {r.generated} · {r.size}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className="badge badge-success" style={{ fontSize: 9 }}>{r.status}</span>
                <span style={{ fontSize: 9, color: '#475569', whiteSpace: 'nowrap' }}>{r.type}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(6,182,212,0.1)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
            👁️ Report Preview — RPT-0044
          </div>
          <pre style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#94a3b8',
            padding: '16px', overflowY: 'auto', maxHeight: 440,
            lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            margin: 0
          }}>{sampleContent}</pre>
        </div>
      </div>
    </div>
  );
}
