// ─── Mock / Static Data for RAILGUARD ITMS ───────────────────────────────

export const TRACK_SEGMENTS = [
  { id: 'S-001', name: 'KM 0–18 | Sec-A (Depot → Junction)', health: 97, status: 'healthy', lastScanned: '2025-01-14 06:22', defects: 0, length: '18 km' },
  { id: 'S-002', name: 'KM 18–34 | Sec-B (Junction → Bridge)', health: 88, status: 'monitor', lastScanned: '2025-01-14 07:15', defects: 2, length: '16 km' },
  { id: 'S-003', name: 'KM 34–51 | Sec-C (Bridge → Tunnel)', health: 72, status: 'warning', lastScanned: '2025-01-14 08:03', defects: 5, length: '17 km' },
  { id: 'S-004', name: 'KM 51–67 | Sec-D (Tunnel Egress)', health: 95, status: 'healthy', lastScanned: '2025-01-14 09:10', defects: 1, length: '16 km' },
  { id: 'S-005', name: 'KM 67–83 | Sec-E (Hill Gradient)', health: 41, status: 'critical', lastScanned: '2025-01-13 22:45', defects: 9, length: '16 km' },
  { id: 'S-006', name: 'KM 83–99 | Sec-F (Station Approach)', health: 93, status: 'healthy', lastScanned: '2025-01-14 05:30', defects: 0, length: '16 km' },
  { id: 'S-007', name: 'KM 99–115 | Sec-G (Goods Yard)', health: 79, status: 'monitor', lastScanned: '2025-01-14 04:00', defects: 3, length: '16 km' },
  { id: 'S-008', name: 'KM 115–130 | Sec-H (Terminal)', health: 99, status: 'healthy', lastScanned: '2025-01-14 10:00', defects: 0, length: '15 km' },
];

export const DETECTION_CLASSES = [
  { class: 'Person', icon: '🚶', count: 7, color: '#ef4444', risk: 'CRITICAL' },
  { class: 'Dog', icon: '🐕', count: 12, color: '#f59e0b', risk: 'HIGH' },
  { class: 'Cow', icon: '🐄', count: 4, color: '#f59e0b', risk: 'HIGH' },
  { class: 'Horse', icon: '🐎', count: 1, color: '#f59e0b', risk: 'HIGH' },
  { class: 'Car', icon: '🚗', count: 3, color: '#06b6d4', risk: 'MEDIUM' },
  { class: 'Truck', icon: '🚚', count: 1, color: '#ef4444', risk: 'CRITICAL' },
  { class: 'Bicycle', icon: '🚲', count: 2, color: '#f59e0b', risk: 'HIGH' },
  { class: 'Debris', icon: '🪨', count: 19, color: '#94a3b8', risk: 'MEDIUM' },
];

export const ALERTS_DATA = [
  { id: 'ALT-0142', ts: '10:48:23', type: 'Obstacle', object: 'Cow', confidence: 96, km: '67.3', severity: 'HIGH', status: 'Active', priority: 1 },
  { id: 'ALT-0141', ts: '10:31:05', type: 'Obstacle', object: 'Person', confidence: 99, km: '34.1', severity: 'CRITICAL', status: 'Active', priority: 1 },
  { id: 'ALT-0140', ts: '10:12:44', type: 'Defect', object: 'Track Crack', confidence: 87, km: '51.8', severity: 'HIGH', status: 'Acknowledged', priority: 2 },
  { id: 'ALT-0139', ts: '09:55:18', type: 'Obstacle', object: 'Debris', confidence: 78, km: '83.0', severity: 'MEDIUM', status: 'Resolved', priority: 3 },
  { id: 'ALT-0138', ts: '09:22:07', type: 'Sensor', object: 'Radar Dropout', confidence: 100, km: '0.0', severity: 'LOW', status: 'Resolved', priority: 4 },
  { id: 'ALT-0137', ts: '08:44:59', type: 'Obstacle', object: 'Truck', confidence: 94, km: '18.4', severity: 'CRITICAL', status: 'Resolved', priority: 1 },
  { id: 'ALT-0136', ts: '08:01:33', type: 'Obstacle', object: 'Dog', confidence: 91, km: '99.7', severity: 'HIGH', status: 'Resolved', priority: 2 },
  { id: 'ALT-0135', ts: '07:15:22', type: 'Defect', object: 'Rail Deformation', confidence: 83, km: '67.9', severity: 'HIGH', status: 'Acknowledged', priority: 2 },
  { id: 'ALT-0134', ts: '06:55:11', type: 'Obstacle', object: 'Bicycle', confidence: 88, km: '115.2', severity: 'MEDIUM', status: 'Resolved', priority: 3 },
  { id: 'ALT-0133', ts: '06:30:00', type: 'Obstacle', object: 'Person', confidence: 97, km: '44.5', severity: 'CRITICAL', status: 'Resolved', priority: 1 },
];

export const MAINTENANCE_UPCOMING = [
  { id: 'MNT-091', component: '77GHz MMW Radar Array', type: 'Calibration', due: '2025-01-18', priority: 'HIGH', technician: 'Field Unit 3', status: 'Scheduled' },
  { id: 'MNT-090', component: 'PTZ Thermal/IR Camera', type: 'Lens Cleaning + Alignment', due: '2025-01-20', priority: 'MEDIUM', technician: 'Field Unit 1', status: 'Scheduled' },
  { id: 'MNT-089', component: 'Dual-Stage Laser System', type: 'Power Supply Check', due: '2025-01-22', priority: 'MEDIUM', technician: 'Field Unit 2', status: 'Pending' },
  { id: 'MNT-088', component: 'IMU + GNSS Module', type: 'Firmware Update v3.2.1', due: '2025-01-25', priority: 'LOW', technician: 'Remote', status: 'Pending' },
  { id: 'MNT-087', component: 'Edge AI (Jetson Orin)', type: 'Model Refresh + Cache Flush', due: '2025-01-28', priority: 'MEDIUM', technician: 'Remote', status: 'Pending' },
];

export const MAINTENANCE_HISTORY = [
  { id: 'MNT-086', component: 'Radar Array', type: 'Full Recalibration', date: '2025-01-07', duration: '3h 20m', status: 'Completed', technician: 'Field Unit 3' },
  { id: 'MNT-085', component: 'Thermal Camera', type: 'PTZ Motor Service', date: '2025-01-05', duration: '1h 45m', status: 'Completed', technician: 'Field Unit 1' },
  { id: 'MNT-084', component: 'Mounting Hardware', type: 'Vibration Damper Replace', date: '2024-12-28', duration: '2h 00m', status: 'Completed', technician: 'Field Unit 2' },
  { id: 'MNT-083', component: 'Laser Unit A', type: 'Alignment & Focus', date: '2024-12-20', duration: '0h 55m', status: 'Completed', technician: 'Field Unit 2' },
  { id: 'MNT-082', component: 'Edge AI System', type: 'OS Patch + Security Update', date: '2024-12-15', duration: '0h 30m', status: 'Completed', technician: 'Remote' },
];

export const DETECTION_LOG = [
  { ts: '10:48:23', cls: 'Cow', conf: 96, bbox: '[142,88,380,310]', snap: true },
  { ts: '10:31:05', cls: 'Person', conf: 99, bbox: '[200,60,290,420]', snap: true },
  { ts: '10:12:44', cls: 'Track Crack', conf: 87, bbox: '[10,280,630,320]', snap: true },
  { ts: '09:55:18', cls: 'Debris', conf: 78, bbox: '[310,300,420,380]', snap: false },
  { ts: '09:22:07', cls: 'Dog', conf: 91, bbox: '[90,200,180,290]', snap: false },
  { ts: '08:44:59', cls: 'Truck', conf: 94, bbox: '[0,100,640,420]', snap: true },
  { ts: '08:01:33', cls: 'Dog', conf: 85, bbox: '[400,220,490,310]', snap: false },
  { ts: '07:15:22', cls: 'Rail Deformation', conf: 83, bbox: '[50,290,580,320]', snap: true },
  { ts: '06:55:11', cls: 'Bicycle', conf: 88, bbox: '[260,180,360,380]', snap: false },
  { ts: '06:30:00', cls: 'Person', conf: 97, bbox: '[180,50,270,420]', snap: true },
];

export const COMPETITIVE_MATRIX = [
  { feature: 'Real-time Obstacle Monitoring', railguard: true, existing: false },
  { feature: 'Instant Multi-Tier Alert System', railguard: true, existing: false },
  { feature: 'Curve & Fog Handling (Radar+IR)', railguard: true, existing: false },
  { feature: 'Response Time < 1 Second', railguard: true, existing: false },
  { feature: 'Track Surface Defect Detection', railguard: true, existing: false },
  { feature: 'Edge AI (On-board Processing)', railguard: true, existing: false },
  { feature: 'GPS / Geo-tagged Incident Logs', railguard: true, existing: false },
  { feature: 'Multi-Sensor Fusion', railguard: true, existing: false },
  { feature: 'Night / Low-Visibility Operation', railguard: true, existing: false },
  { feature: 'Predictive Maintenance Analytics', railguard: true, existing: false },
];

export const REPORTS_LIST = [
  { id: 'RPT-0044', name: 'Daily Safety Summary — Jan 14, 2025', type: 'Daily Summary', generated: '2025-01-14 06:00', size: '1.2 MB', status: 'Ready' },
  { id: 'RPT-0043', name: 'Weekly Analysis — Jan 7–13, 2025', type: 'Weekly Analysis', generated: '2025-01-13 23:59', size: '4.8 MB', status: 'Ready' },
  { id: 'RPT-0042', name: 'Incident Report — ALT-0133 (Person Detected)', type: 'Incident Report', generated: '2025-01-13 07:30', size: '0.9 MB', status: 'Ready' },
  { id: 'RPT-0041', name: 'Maintenance Report — MNT-085/086', type: 'Maintenance Report', generated: '2025-01-07 20:00', size: '2.1 MB', status: 'Ready' },
  { id: 'RPT-0040', name: 'Weekly Analysis — Dec 31, 2024 – Jan 6, 2025', type: 'Weekly Analysis', generated: '2025-01-06 23:59', size: '5.1 MB', status: 'Ready' },
];

export const ANALYTICS_7D = {
  labels: ['Jan 8', 'Jan 9', 'Jan 10', 'Jan 11', 'Jan 12', 'Jan 13', 'Jan 14'],
  detections: [34, 29, 52, 41, 38, 47, 49],
  alerts: [4, 3, 7, 5, 4, 6, 8],
  uptime: [99.8, 99.9, 99.7, 100, 99.9, 99.8, 99.9],
  responseTime: [0.31, 0.29, 0.34, 0.28, 0.30, 0.32, 0.27],
};

export const SENSOR_SPECS = {
  radar: { name: '77 GHz MMW Radar', health: 98, lastCal: '2025-01-07 14:30', firmware: 'v4.2.1', signal: -42, temp: 47, range: '0–1000 m', detectRate: '120 Hz', description: 'Long-range obstacle detection, operates in fog/rain/dust' },
  thermal: { name: 'PTZ Thermal/IR Camera', health: 95, lastCal: '2025-01-05 10:00', firmware: 'v2.8.0', signal: -61, temp: 52, range: '640×512 px', detectRate: '30 fps', description: 'Night & fog confirmation, pan-tilt-zoom tracking, 8–14 μm' },
  laser: { name: 'Dual-Stage Laser System', health: 91, lastCal: '2024-12-20 09:00', firmware: 'v1.9.4', signal: -38, temp: 55, range: '±0.1 mm res', detectRate: '5 kHz', description: 'Rail surface & geometry monitoring, crack/deformation profiling' },
  imu: { name: 'IMU + GNSS/GPS Module', health: 99, lastCal: '2025-01-07 08:00', firmware: 'v3.1.8', signal: -78, temp: 38, range: 'GPS ±1.5 m', detectRate: '200 Hz', description: 'Curve awareness, geo-tagging, heading & vibration sensing' },
};
