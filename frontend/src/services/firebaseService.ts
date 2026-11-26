import { database, isFirebaseConfigured } from '@/config/firebase';
import {
  ref,
  onValue,
  query,
  orderByChild,
  limitToLast,
  update,
  set,
  Unsubscribe,
} from 'firebase/database';
import { PatientProfile } from '@/types/patient';
import { DeviceTelemetry } from '@/types/device';
import { VitalReading, ChartDataPoint, VitalThresholds } from '@/types/vitals';
import { AlertRecord } from '@/types/alerts';
import { DEFAULT_THRESHOLDS } from '@/lib/thresholdEvaluator';

export const DEFAULT_PATIENT_ID = 'patient_01';
export const DEFAULT_DEVICE_ID = 'esp8266_01';

/**
 * ==============================================================================
 * Firebase Realtime Database Service
 * Strongly typed listeners and write helpers strictly matching:
 * - docs/DATABASE_SCHEMA.md
 * - database.rules.json
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. PATIENT DEMOGRAPHICS (/patients/{patientId})
// ------------------------------------------------------------------------------
export function subscribeToPatient(
  patientId: string = DEFAULT_PATIENT_ID,
  callback: (patient: PatientProfile | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }

  const patientRef = ref(database, `patients/${patientId}`);
  return onValue(
    patientRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      const val = snapshot.val();
      const resolvedName = val.name ?? val.fullName ?? 'Registered Patient';
      const profile: PatientProfile = {
        patientId: val.patientId || patientId,
        fullName: resolvedName,
        name: resolvedName,
        age: typeof val.age === 'number' ? val.age : Number(val.age) || 0,
        gender: val.gender || 'Other',
        admissionDate:
          val.admissionDate ||
          (val.registeredAt
            ? new Date(val.registeredAt).toISOString().split('T')[0]
            : '2026-11-15'),
        roomBed: val.roomBed || 'Telemetry Suite B-12',
        assignedDeviceId: val.assignedDeviceId || DEFAULT_DEVICE_ID,
        assignedDoctor: val.assignedDoctor || val.assignedDoctorId || 'Attending Physician',
      };
      callback(profile);
    },
    (error) => {
      onError?.(error);
    }
  );
}

// ------------------------------------------------------------------------------
// 2. DEVICE TELEMETRY & HEARTBEAT (/devices/{deviceId})
// ------------------------------------------------------------------------------
export function subscribeToDevice(
  deviceId: string = DEFAULT_DEVICE_ID,
  callback: (device: DeviceTelemetry | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }

  const deviceRef = ref(database, `devices/${deviceId}`);
  return onValue(
    deviceRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      const val = snapshot.val();
      const telemetry: DeviceTelemetry = {
        deviceId: val.deviceId || deviceId,
        hardwareModel: val.hardwareModel || 'NodeMCU ESP-12E (Tensilica L106 @ 80MHz)',
        firmwareVersion: val.firmwareVersion || 'v1.0.0-academic',
        macAddress: val.macAddress || 'N/A',
        ipAddress: val.ipAddress || 'DHCP Assigned',
        rssi: typeof val.rssi === 'number' ? val.rssi : -60,
        uptimeSeconds: typeof val.uptimeSeconds === 'number' ? val.uptimeSeconds : 0,
        lastSeen: typeof val.lastSeen === 'number' ? val.lastSeen : 0,
        status: val.status || 'STANDBY',
        wifiSsid: val.wifiSsid || 'Academic_IoT_WLAN',
      };
      callback(telemetry);
    },
    (error) => {
      onError?.(error);
    }
  );
}

// ------------------------------------------------------------------------------
// 3. LATEST VITALS (/vitals/latest/{patientId})
// ------------------------------------------------------------------------------
export function subscribeToLatestVitals(
  patientId: string = DEFAULT_PATIENT_ID,
  callback: (vitals: VitalReading | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }

  const vitalsRef = ref(database, `vitals/latest/${patientId}`);
  return onValue(
    vitalsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      const val = snapshot.val();
      const vitals: VitalReading = {
        heartRate: typeof val.heartRate === 'number' ? val.heartRate : Number(val.heartRate) || 0,
        temperature:
          typeof val.temperature === 'number'
            ? val.temperature
            : Number(val.temperature) || 0,
        timestamp: typeof val.timestamp === 'number' ? val.timestamp : Date.now(),
        status: val.status || 'NORMAL',
        deviceId: val.deviceId || DEFAULT_DEVICE_ID,
      };
      callback(vitals);
    },
    (error) => {
      onError?.(error);
    }
  );
}

// ------------------------------------------------------------------------------
// 4. HISTORICAL VITALS (/vitals/history/{patientId})
// ------------------------------------------------------------------------------
export function subscribeToHistoricalVitals(
  patientId: string = DEFAULT_PATIENT_ID,
  limitCount: number = 30,
  callback: (history: ChartDataPoint[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const historyQuery = query(
    ref(database, `vitals/history/${patientId}`),
    orderByChild('timestamp'),
    limitToLast(limitCount)
  );

  return onValue(
    historyQuery,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const list: ChartDataPoint[] = [];
      snapshot.forEach((childSnapshot) => {
        const val = childSnapshot.val();
        const ts = typeof val.timestamp === 'number' ? val.timestamp : Date.now();
        const d = new Date(ts);
        const timeLabel = d.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        list.push({
          timeLabel,
          timestamp: ts,
          heartRate: typeof val.heartRate === 'number' ? val.heartRate : Number(val.heartRate) || 0,
          temperature:
            typeof val.temperature === 'number'
              ? val.temperature
              : Number(val.temperature) || 0,
          status: val.status || 'NORMAL',
        });
      });
      callback(list);
    },
    (error) => {
      onError?.(error);
    }
  );
}

// ------------------------------------------------------------------------------
// 5. CLINICAL ALERTS (/alerts/{patientId})
// ------------------------------------------------------------------------------
export function subscribeToAlerts(
  patientId: string = DEFAULT_PATIENT_ID,
  callback: (alerts: AlertRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const alertsQuery = query(
    ref(database, `alerts/${patientId}`),
    orderByChild('timestamp'),
    limitToLast(50)
  );

  return onValue(
    alertsQuery,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const list: AlertRecord[] = [];
      snapshot.forEach((childSnapshot) => {
        const val = childSnapshot.val();
        list.push({
          alertId: val.alertId || childSnapshot.key || '',
          patientId: val.patientId || patientId,
          parameter: val.parameter,
          parameterLabel:
            val.parameter === 'HEART_RATE' ? 'Heart Rate' : 'Body Temperature',
          value: typeof val.value === 'number' ? val.value : Number(val.value) || 0,
          unit: val.parameter === 'HEART_RATE' ? 'BPM' : '°C',
          severity: val.severity || 'WARNING',
          message: val.message || '',
          timestamp: typeof val.timestamp === 'number' ? val.timestamp : 0,
          acknowledged: Boolean(val.acknowledged),
          acknowledgedAt:
            typeof val.acknowledgedAt === 'number' ? val.acknowledgedAt : undefined,
        });
      });
      // Sort descending so the most recent alerts appear first in the feed
      list.sort((a, b) => b.timestamp - a.timestamp);
      callback(list);
    },
    (error) => {
      onError?.(error);
    }
  );
}

/**
 * Acknowledge an alert (one-way update: acknowledged = true, acknowledgedAt = Date.now())
 * Strictly matches database.rules.json:
 * data.acknowledged == false && newData.acknowledged == true && newData.acknowledgedAt.isNumber()
 */
export async function acknowledgeAlert(
  patientId: string = DEFAULT_PATIENT_ID,
  alertId: string
): Promise<void> {
  if (!isFirebaseConfigured) {
    console.warn('[Firebase RTDB] Cannot acknowledge alert: Firebase is not configured.');
    return;
  }
  const alertRef = ref(database, `alerts/${patientId}/${alertId}`);
  await update(alertRef, {
    acknowledged: true,
    acknowledgedAt: Date.now(),
  });
}

/**
 * Create a new clinical alert (strictly matches database.rules.json creation rules)
 */
export async function createAlert(
  patientId: string = DEFAULT_PATIENT_ID,
  alert: Omit<AlertRecord, 'acknowledged' | 'acknowledgedAt'>
): Promise<void> {
  if (!isFirebaseConfigured) {
    console.warn('[Firebase RTDB] Cannot create alert: Firebase is not configured.');
    return;
  }
  const alertId = alert.alertId || `alt_${Date.now()}`;
  const alertRef = ref(database, `alerts/${patientId}/${alertId}`);
  await set(alertRef, {
    alertId,
    patientId,
    parameter: alert.parameter,
    value: alert.value,
    severity: alert.severity,
    message: alert.message,
    timestamp: alert.timestamp || Date.now(),
    acknowledged: false,
  });
}

// ------------------------------------------------------------------------------
// 6. CLINICAL DEMO THRESHOLDS (/thresholds/{patientId})
// ------------------------------------------------------------------------------
export function subscribeToThresholds(
  patientId: string = DEFAULT_PATIENT_ID,
  callback: (thresholds: VitalThresholds | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }

  const thresholdsRef = ref(database, `thresholds/${patientId}`);
  return onValue(
    thresholdsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      const val = snapshot.val();
      const thresholds: VitalThresholds = {
        heartRateMinNormal:
          typeof val.heartRateMinNormal === 'number'
            ? val.heartRateMinNormal
            : DEFAULT_THRESHOLDS.heartRateMinNormal,
        heartRateMaxNormal:
          typeof val.heartRateMaxNormal === 'number'
            ? val.heartRateMaxNormal
            : DEFAULT_THRESHOLDS.heartRateMaxNormal,
        heartRateMinWarning:
          typeof val.heartRateMinWarning === 'number'
            ? val.heartRateMinWarning
            : DEFAULT_THRESHOLDS.heartRateMinWarning,
        heartRateMaxWarning:
          typeof val.heartRateMaxWarning === 'number'
            ? val.heartRateMaxWarning
            : DEFAULT_THRESHOLDS.heartRateMaxWarning,
        tempMinNormal:
          typeof val.tempMinNormal === 'number'
            ? val.tempMinNormal
            : DEFAULT_THRESHOLDS.tempMinNormal,
        tempMaxNormal:
          typeof val.tempMaxNormal === 'number'
            ? val.tempMaxNormal
            : DEFAULT_THRESHOLDS.tempMaxNormal,
        tempMinWarning:
          typeof val.tempMinWarning === 'number'
            ? val.tempMinWarning
            : DEFAULT_THRESHOLDS.tempMinWarning,
        tempMaxWarning:
          typeof val.tempMaxWarning === 'number'
            ? val.tempMaxWarning
            : DEFAULT_THRESHOLDS.tempMaxWarning,
      };
      callback(thresholds);
    },
    (error) => {
      onError?.(error);
    }
  );
}

/**
 * Update clinical thresholds in Firebase Realtime Database
 * Strictly adheres to ordering rules in database.rules.json
 */
export async function updateThresholds(
  patientId: string = DEFAULT_PATIENT_ID,
  thresholds: VitalThresholds
): Promise<void> {
  if (!isFirebaseConfigured) {
    console.warn('[Firebase RTDB] Cannot update thresholds: Firebase is not configured.');
    return;
  }
  const thresholdsRef = ref(database, `thresholds/${patientId}`);
  await set(thresholdsRef, thresholds);
}
