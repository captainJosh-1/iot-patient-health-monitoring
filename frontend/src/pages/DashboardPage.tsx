import React, { useState, useEffect } from 'react';
import { PatientBanner } from '@/components/dashboard/PatientBanner';
import { VitalCard } from '@/components/dashboard/VitalCard';
import { OverallStatusBanner } from '@/components/dashboard/OverallStatusBanner';
import { HeartRateChart } from '@/components/dashboard/HeartRateChart';
import { TemperatureChart } from '@/components/dashboard/TemperatureChart';
import { AlertsFeed } from '@/components/dashboard/AlertsFeed';
import { DeviceStatusCard } from '@/components/dashboard/DeviceStatusCard';
import { ThresholdsModal } from '@/components/dashboard/ThresholdsModal';
import { NavTab } from '@/components/layout/Sidebar';
import {
  DEMO_PATIENT,
  DEMO_DEVICE,
  DEMO_LATEST_VITALS,
  DEMO_CHART_HISTORY,
  DEMO_ALERTS,
} from '@/data/mockData';
import {
  evaluateHeartRateStatus,
  evaluateTemperatureStatus,
  evaluateOverallStatus,
  DEFAULT_THRESHOLDS,
} from '@/lib/thresholdEvaluator';
import { VitalThresholds, ChartDataPoint } from '@/types/vitals';
import { AlertRecord } from '@/types/alerts';
import { Play, Pause, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardPageProps {
  activeTab: NavTab;
  onAlertCountChange?: (count: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  activeTab,
  onAlertCountChange,
}) => {
  // State variables for telemetry & demonstration
  const [thresholds, setThresholds] = useState<VitalThresholds>(DEFAULT_THRESHOLDS);
  const [currentVitals, setCurrentVitals] = useState(DEMO_LATEST_VITALS);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(DEMO_CHART_HISTORY);
  const [alerts, setAlerts] = useState<AlertRecord[]>(DEMO_ALERTS);
  const [isLiveSimulation, setIsLiveSimulation] = useState(true);
  const [secondsAgo, setSecondsAgo] = useState(3);

  // Derived statuses
  const hrStatus = evaluateHeartRateStatus(currentVitals.heartRate, thresholds);
  const tempStatus = evaluateTemperatureStatus(currentVitals.temperature, thresholds);
  const overallStatus = evaluateOverallStatus(hrStatus, tempStatus);

  // Update parent alert count
  useEffect(() => {
    const activeAlerts = alerts.filter(a => !a.acknowledged).length;
    onAlertCountChange?.(activeAlerts);
  }, [alerts, onAlertCountChange]);

  // Gentle live demo simulation ticker (updates subtle vital fluctuations every 3 seconds)
  useEffect(() => {
    if (!isLiveSimulation) return;

    const interval = setInterval(() => {
      setSecondsAgo(prev => (prev >= 4 ? 1 : prev + 1));

      // Small natural physiological fluctuation (±1-2 BPM, ±0.1°C)
      const hrDelta = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const tempDelta = (Math.random() * 0.1 - 0.05);

      setCurrentVitals(prev => {
        const newHr = Math.max(50, Math.min(130, prev.heartRate + hrDelta));
        const newTemp = Math.max(34.0, Math.min(40.0, Number((prev.temperature + tempDelta).toFixed(1))));
        const newHrStatus = evaluateHeartRateStatus(newHr, thresholds);
        const newTempStatus = evaluateTemperatureStatus(newTemp, thresholds);
        const newOverall = evaluateOverallStatus(newHrStatus, newTempStatus);

        const now = Date.now();
        const timeLabel = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Update historical chart data (keeping last 30 samples)
        setChartData(prevData => [
          ...prevData.slice(1),
          {
            timeLabel,
            timestamp: now,
            heartRate: newHr,
            temperature: newTemp,
            status: newOverall,
          },
        ]);

        return {
          heartRate: newHr,
          temperature: newTemp,
          timestamp: now,
          status: newOverall,
          deviceId: DEMO_DEVICE.deviceId,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveSimulation, thresholds]);

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.alertId === alertId
          ? { ...a, acknowledged: true, acknowledgedAt: Date.now() }
          : a
      )
    );
  };

  // Quick simulation scenario triggers for demonstration
  const triggerScenario = (scenario: 'normal' | 'tachycardia' | 'fever') => {
    const now = Date.now();
    let newHr = 74;
    let newTemp = 36.6;

    if (scenario === 'tachycardia') {
      newHr = 118; // Abnormal tachycardia
      newTemp = 37.2;
      // Synthesize alert
      const newAlert: AlertRecord = {
        alertId: `alt_${now}`,
        patientId: DEMO_PATIENT.patientId,
        parameter: 'HEART_RATE',
        parameterLabel: 'Heart Rate',
        value: 118,
        unit: 'BPM',
        severity: 'ABNORMAL',
        message: 'Acute Tachycardia Detected: 118 BPM exceeded 115 BPM abnormal threshold',
        timestamp: now,
        acknowledged: false,
      };
      setAlerts(prev => [newAlert, ...prev]);
    } else if (scenario === 'fever') {
      newHr = 96;
      newTemp = 39.1; // Abnormal hyperthermia
      const newAlert: AlertRecord = {
        alertId: `alt_${now}`,
        patientId: DEMO_PATIENT.patientId,
        parameter: 'TEMPERATURE',
        parameterLabel: 'Body Temperature',
        value: 39.1,
        unit: '°C',
        severity: 'ABNORMAL',
        message: 'High Febrile Spike: 39.1 °C exceeded 38.9 °C abnormal threshold',
        timestamp: now,
        acknowledged: false,
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    setCurrentVitals({
      heartRate: newHr,
      temperature: newTemp,
      timestamp: now,
      status: evaluateOverallStatus(evaluateHeartRateStatus(newHr, thresholds), evaluateTemperatureStatus(newTemp, thresholds)),
      deviceId: DEMO_DEVICE.deviceId,
    });
  };

  // If viewing Settings tab
  if (activeTab === 'settings') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <ThresholdsModal
          thresholds={thresholds}
          onUpdateThresholds={setThresholds}
        />
      </div>
    );
  }

  // If viewing Alerts tab
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

  // Primary Monitoring & Overview Tab
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Demonstration Banner & Simulation Controls */}
      <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-sky-900">
          <Info className="h-4 w-4 text-clinical-blue shrink-0" />
          <span>
            <strong>Academic Demonstration Mode:</strong> Rendering synthetic telemetry data. Ready for Firebase Realtime Database integration in Phase 6.
          </span>
        </div>

        {/* Demo Scenario Toggles */}
        <div className="flex items-center space-x-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsLiveSimulation(!isLiveSimulation)}
            className="text-[11px] h-7 px-2.5 bg-white"
          >
            {isLiveSimulation ? (
              <>
                <Pause className="h-3 w-3 mr-1 text-amber-600" /> Pause Ticker
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1 text-emerald-600" /> Resume Ticker
              </>
            )}
          </Button>

          <span className="text-slate-300">|</span>

          <span className="text-muted text-[11px]">Test Anomaly:</span>
          <button
            onClick={() => triggerScenario('normal')}
            className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-medium"
          >
            Normal (74 BPM)
          </button>
          <button
            onClick={() => triggerScenario('tachycardia')}
            className="px-2 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[11px] font-medium flex items-center"
          >
            <Zap className="h-3 w-3 mr-0.5" /> High BPM (118)
          </button>
          <button
            onClick={() => triggerScenario('fever')}
            className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 text-[11px] font-medium flex items-center"
          >
            <Zap className="h-3 w-3 mr-0.5" /> Fever (39.1°C)
          </button>
        </div>
      </div>

      {/* A. Patient Information Banner */}
      <PatientBanner
        patient={DEMO_PATIENT}
        overallStatus={overallStatus}
        lastUpdated={currentVitals.timestamp}
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
          deltaText={isLiveSimulation ? "Live Ingestion" : "Static"}
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
          deltaText={isLiveSimulation ? "Live Ingestion" : "Static"}
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
          device={DEMO_DEVICE}
          secondsSinceLastSeen={secondsAgo}
        />
      </div>
    </div>
  );
};
