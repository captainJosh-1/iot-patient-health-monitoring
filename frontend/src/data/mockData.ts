import { PatientProfile, DoctorProfile } from '../types/patient';
import { DeviceTelemetry } from '../types/device';
import { VitalReading, ChartDataPoint } from '../types/vitals';
import { AlertRecord } from '../types/alerts';
import { evaluateHeartRateStatus, evaluateTemperatureStatus, evaluateOverallStatus } from '../lib/thresholdEvaluator';

/**
 * ==============================================================================
 * DEMONSTRATION DATA ONLY
 * This file contains strictly synthetic baseline data for UI validation.
 * Real physiological readings will stream from Firebase in Phase 6.
 * ==============================================================================
 */

export const DEMO_DOCTOR: DoctorProfile = {
  doctorId: 'doc_sarah_jenkins_01',
  fullName: 'Dr. Sarah Jenkins, MD',
  title: 'Attending Cardiologist',
  department: 'Cardiopulmonary Telemetry Suite',
  hospital: 'Metro Academic Medical Center',
  email: 's.jenkins@metromedical.org',
};

export const DEMO_PATIENT: PatientProfile = {
  patientId: 'PAT-84920',
  fullName: 'Eleanor Vance',
  age: 64,
  gender: 'Female',
  admissionDate: '2026-11-15',
  roomBed: 'Telemetry Suite B-12',
  assignedDeviceId: 'esp8266_01',
  assignedDoctor: 'Dr. Sarah Jenkins, MD',
};

const NOW = Date.now();

export const DEMO_DEVICE: DeviceTelemetry = {
  deviceId: 'esp8266_01',
  hardwareModel: 'NodeMCU ESP-12E (Tensilica L106 @ 80MHz)',
  firmwareVersion: 'v1.0.0-academic',
  macAddress: '84:F3:EB:4B:92:1A',
  ipAddress: '192.168.1.104',
  rssi: -64, // dBm (Strong)
  uptimeSeconds: 3840,
  lastSeen: NOW - 3000, // 3 seconds ago (Online)
  status: 'ONLINE',
  wifiSsid: 'Academic_IoT_WLAN',
};

export const DEMO_LATEST_VITALS: VitalReading = {
  heartRate: 74,
  temperature: 36.6,
  timestamp: NOW - 3000,
  status: 'NORMAL',
  deviceId: 'esp8266_01',
};

// Generate 30 realistic time-series points (one every 10 seconds over the last 5 minutes)
export const DEMO_CHART_HISTORY: ChartDataPoint[] = [
  { offsetSec: 290, hr: 72, temp: 36.5 },
  { offsetSec: 280, hr: 73, temp: 36.5 },
  { offsetSec: 270, hr: 75, temp: 36.6 },
  { offsetSec: 260, hr: 74, temp: 36.6 },
  { offsetSec: 250, hr: 76, temp: 36.5 },
  { offsetSec: 240, hr: 78, temp: 36.6 },
  { offsetSec: 230, hr: 81, temp: 36.7 },
  { offsetSec: 220, hr: 85, temp: 36.7 },
  { offsetSec: 210, hr: 92, temp: 36.8 },
  { offsetSec: 200, hr: 98, temp: 36.9 },
  { offsetSec: 190, hr: 104, temp: 37.1 }, // Warning peak
  { offsetSec: 180, hr: 106, temp: 37.3 }, // Warning peak
  { offsetSec: 170, hr: 102, temp: 37.2 },
  { offsetSec: 160, hr: 95, temp: 37.0 },
  { offsetSec: 150, hr: 88, temp: 36.9 },
  { offsetSec: 140, hr: 82, temp: 36.8 },
  { offsetSec: 130, hr: 79, temp: 36.7 },
  { offsetSec: 120, hr: 76, temp: 36.7 },
  { offsetSec: 110, hr: 75, temp: 36.6 },
  { offsetSec: 100, hr: 73, temp: 36.6 },
  { offsetSec: 90, hr: 74, temp: 36.6 },
  { offsetSec: 80, hr: 76, temp: 36.6 },
  { offsetSec: 70, hr: 75, temp: 36.5 },
  { offsetSec: 60, hr: 74, temp: 36.6 },
  { offsetSec: 50, hr: 73, temp: 36.6 },
  { offsetSec: 40, hr: 75, temp: 36.6 },
  { offsetSec: 30, hr: 76, temp: 36.7 },
  { offsetSec: 20, hr: 74, temp: 36.6 },
  { offsetSec: 10, hr: 73, temp: 36.6 },
  { offsetSec: 0, hr: 74, temp: 36.6 },
].map(item => {
  const ts = NOW - item.offsetSec * 1000;
  const d = new Date(ts);
  const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const hrStatus = evaluateHeartRateStatus(item.hr);
  const tempStatus = evaluateTemperatureStatus(item.temp);
  return {
    timeLabel,
    timestamp: ts,
    heartRate: item.hr,
    temperature: item.temp,
    status: evaluateOverallStatus(hrStatus, tempStatus),
  };
});

export const DEMO_ALERTS: AlertRecord[] = [
  {
    alertId: 'alt_demo_01',
    patientId: 'PAT-84920',
    parameter: 'HEART_RATE',
    parameterLabel: 'Heart Rate',
    value: 106,
    unit: 'BPM',
    severity: 'WARNING',
    message: 'Elevated Heart Rate (106 BPM exceeded 100 BPM normal upper boundary)',
    timestamp: NOW - 180 * 1000, // 3 minutes ago
    acknowledged: false,
  },
  {
    alertId: 'alt_demo_02',
    patientId: 'PAT-84920',
    parameter: 'TEMPERATURE',
    parameterLabel: 'Body Temperature',
    value: 38.2,
    unit: '°C',
    severity: 'WARNING',
    message: 'Mild Febrile Elevation (38.2 °C exceeded 38.0 °C normal baseline)',
    timestamp: NOW - 1200 * 1000, // 20 minutes ago
    acknowledged: true,
    acknowledgedAt: NOW - 900 * 1000,
  },
];
