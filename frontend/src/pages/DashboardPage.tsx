import React, { useEffect, useState } from 'react';
import { PatientBanner } from '@/components/dashboard/PatientBanner';
import { VitalCard } from '@/components/dashboard/VitalCard';
import { OverallStatusBanner } from '@/components/dashboard/OverallStatusBanner';
import { HeartRateChart } from '@/components/dashboard/HeartRateChart';
import { TemperatureChart } from '@/components/dashboard/TemperatureChart';
import { AlertsFeed } from '@/components/dashboard/AlertsFeed';
import { DeviceStatusCard } from '@/components/dashboard/DeviceStatusCard';
import { ThresholdsModal } from '@/components/dashboard/ThresholdsModal';
import { NavTab } from '@/components/layout/Sidebar';
import { usePatient } from '@/hooks/usePatient';
import { useDevice } from '@/hooks/useDevice';
import { useVitals } from '@/hooks/useVitals';
import { useAlerts } from '@/hooks/useAlerts';
import { useHistory } from '@/hooks/useHistory';
import { useThresholds } from '@/hooks/useThresholds';
import {
  DEFAULT_PATIENT_ID,
  DEFAULT_DEVICE_ID,
} from '@/services/firebaseService';
import {
  evaluateHeartRateStatus,
  evaluateTemperatureStatus,
  evaluateOverallStatus,
} from '@/lib/thresholdEvaluator';
import { VitalThresholds, VitalReading, ChartDataPoint } from '@/types/vitals';
import { Cloud, Zap } from 'lucide-react';

interface DashboardPageProps {
  activeTab: NavTab;
  onAlertCountChange?: (count: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  activeTab,
  onAlertCountChange,
}) => {
  // 1. Live Firebase Realtime Database Subscriptions
  const { patient } = usePatient(DEFAULT_PATIENT_ID);
  const { thresholds, saveThresholds } = useThresholds(DEFAULT_PATIENT_ID);
  const { vitals: liveVitals } = useVitals(DEFAULT_PATIENT_ID);
  const { device, secondsSinceLastSeen, isOffline } = useDevice(DEFAULT_DEVICE_ID);
  const { alerts, activeAlertCount, acknowledgeAlert, createAlert } =
    useAlerts(DEFAULT_PATIENT_ID);
  const { history: liveHistory } = useHistory(DEFAULT_PATIENT_ID, 30);

  // 2. Safe Fallback Vitals (when node is uninitialized or awaiting hardware)
  const currentVitals: VitalReading = liveVitals || {
    heartRate: 0,
    temperature: 0,
    timestamp: 0,
    status: 'NORMAL',
    deviceId: DEFAULT_DEVICE_ID,
  };

  const hasLiveVitals = currentVitals.timestamp > 0;

  // 3. Derived Physiological Statuses
  const hrStatus = hasLiveVitals
    ? evaluateHeartRateStatus(currentVitals.heartRate, thresholds)
    : 'NORMAL';
  const tempStatus = hasLiveVitals
    ? evaluateTemperatureStatus(currentVitals.temperature, thresholds)
    : 'NORMAL';
  const overallStatus = hasLiveVitals
    ? evaluateOverallStatus(hrStatus, tempStatus)
    : 'NORMAL';

  // 4. Historical Chart Data Assembly
  const chartData: ChartDataPoint[] =
    liveHistory.length > 0
      ? liveHistory
      : hasLiveVitals
      ? [
          {
            timeLabel: new Date(currentVitals.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            timestamp: currentVitals.timestamp,
            heartRate: currentVitals.heartRate,
            temperature: currentVitals.temperature,
            status: overallStatus,
          },
        ]
      : [];

  // 5. Update parent layout with unacknowledged alert badge count
  useEffect(() => {
    onAlertCountChange?.(activeAlertCount);
  }, [activeAlertCount, onAlertCountChange]);

  // 6. Alert Acknowledgment Handler (Firebase RTDB one-way update)
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
    } catch (err) {
      console.error('[DashboardPage] Failed to acknowledge alert:', err);
    }
  };

  // 7. Clinical Thresholds Update Handler (Firebase RTDB persist)
  const handleUpdateThresholds = async (newThresholds: VitalThresholds) => {
    try {
      await saveThresholds(newThresholds);
    } catch (err) {
      console.error('[DashboardPage] Failed to save thresholds:', err);
    }
  };

  // 8. Scenario Test Dispatcher (writes test anomalies directly to Firebase RTDB)
  const [isDispatching, setIsDispatching] = useState(false);
  const triggerScenario = async (scenario: 'tachycardia' | 'fever') => {
    const now = Date.now();
    try {
      setIsDispatching(true);
      if (scenario === 'tachycardia') {
        await createAlert({
          alertId: `alt_${now}`,
          patientId: DEFAULT_PATIENT_ID,
          parameter: 'HEART_RATE',
          parameterLabel: 'Heart Rate',
          value: 118,
          unit: 'BPM',
          severity: 'ABNORMAL',
          message: 'Acute Tachycardia: 118 BPM exceeded abnormal threshold',
          timestamp: now,
        });
      } else if (scenario === 'fever') {
        await createAlert({
          alertId: `alt_${now}`,
          patientId: DEFAULT_PATIENT_ID,
          parameter: 'TEMPERATURE',
          parameterLabel: 'Body Temperature',
          value: 39.1,
          unit: '°C',
          severity: 'ABNORMAL',
          message: 'High Febrile Spike: 39.1 °C exceeded abnormal threshold',
          timestamp: now,
        });
      }
    } catch (err) {
      console.error('[DashboardPage] Failed to dispatch test scenario:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  // Tab: Settings (Threshold Management)
  if (activeTab === 'settings') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <ThresholdsModal
          thresholds={thresholds}
          onUpdateThresholds={handleUpdateThresholds}
        />
      </div>
    );
  }

  // Tab: Alerts (Full Clinical Alerts Feed)
  if (activeTab === 'alerts') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <AlertsFeed
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />
      </div>
    );
  }

  // Tab: Overview & Live Telemetry Monitoring
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Real-Time Cloud Synchronization Banner */}
      <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-sky-900">
          <Cloud className="h-4 w-4 text-clinical-blue shrink-0 animate-pulse" />
          <span>
            <strong>Firebase Realtime Database:</strong>{' '}
            {hasLiveVitals ? (
              <span className="text-emerald-700 font-semibold">
                Live telemetry stream active ({device.status === 'ONLINE' ? 'ESP8266 Online' : device.status})
              </span>
            ) : (
              <span className="text-slate-600">
                Connected to cloud. Awaiting ESP8266 telemetry payload for{' '}
                <code className="bg-sky-100 px-1 py-0.5 rounded font-mono text-sky-900">
                  {DEFAULT_PATIENT_ID}
                </code>{' '}
                ({device.status === 'ONLINE' ? 'Device Online' : 'Device in Standby/Disconnected'}).
              </span>
            )}
          </span>
        </div>

        {/* Cloud Test Anomaly Trigger Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-muted text-[11px]">Dispatch Cloud Alert:</span>
          <button
            onClick={() => triggerScenario('tachycardia')}
            disabled={isDispatching}
            className="px-2 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[11px] font-medium flex items-center transition-colors disabled:opacity-50"
            title="Writes a 118 BPM Tachycardia alert directly to Firebase RTDB"
          >
            <Zap className="h-3 w-3 mr-0.5" /> High BPM (118)
          </button>
          <button
            onClick={() => triggerScenario('fever')}
            disabled={isDispatching}
            className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 text-[11px] font-medium flex items-center transition-colors disabled:opacity-50"
            title="Writes a 39.1 °C Febrile Spike alert directly to Firebase RTDB"
          >
            <Zap className="h-3 w-3 mr-0.5" /> Fever (39.1°C)
          </button>
        </div>
      </div>

      {/* A. Patient Information Banner */}
      <PatientBanner
        patient={patient}
        overallStatus={overallStatus}
        lastUpdated={currentVitals.timestamp || Date.now()}
      />

      {/* C. Overall Monitoring Status Banner */}
      <OverallStatusBanner
        status={overallStatus}
        heartRate={currentVitals.heartRate}
        temperature={currentVitals.temperature}
      />

      {/* B. Primary Vital Monitoring Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VitalCard
          title="Heart Rate"
          value={currentVitals.heartRate}
          unit="BPM"
          status={hrStatus}
          normalRange={`${thresholds.heartRateMinNormal} – ${thresholds.heartRateMaxNormal} BPM`}
          sensorName="Analog Pulse Sensor"
          pinMapping="Pin A0"
          iconType="heart"
          deltaText={
            hasLiveVitals
              ? isOffline
                ? 'Hardware Stale'
                : 'Live Stream'
              : 'Awaiting Hardware'
          }
        />

        <VitalCard
          title="Body Temperature"
          value={currentVitals.temperature}
          unit="°C"
          status={tempStatus}
          normalRange={`${thresholds.tempMinNormal.toFixed(1)} – ${thresholds.tempMaxNormal.toFixed(1)} °C`}
          sensorName="DS18B20 1-Wire Probe"
          pinMapping="Pin D2 (GPIO4)"
          iconType="temp"
          deltaText={
            hasLiveVitals
              ? isOffline
                ? 'Hardware Stale'
                : 'Live Stream'
              : 'Awaiting Hardware'
          }
        />
      </div>

      {/* D & E. Historical Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HeartRateChart
          data={chartData}
          currentBpm={currentVitals.heartRate}
        />
        <TemperatureChart
          data={chartData}
          currentTemp={currentVitals.temperature}
        />
      </div>

      {/* F & G. Alerts and Device Connectivity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsFeed
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />
        <DeviceStatusCard
          device={device}
          secondsSinceLastSeen={secondsSinceLastSeen}
        />
      </div>
    </div>
  );
};
