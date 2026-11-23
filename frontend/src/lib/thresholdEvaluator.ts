import { PhysiologicalStatus, VitalThresholds } from '../types/vitals';

export const DEFAULT_THRESHOLDS: VitalThresholds = {
  heartRateMinNormal: 60,
  heartRateMaxNormal: 100,
  heartRateMinWarning: 50,
  heartRateMaxWarning: 115,
  tempMinNormal: 35.0,
  tempMaxNormal: 38.0,
  tempMinWarning: 34.0,
  tempMaxWarning: 38.9,
};

export function evaluateHeartRateStatus(bpm: number, thresholds: VitalThresholds = DEFAULT_THRESHOLDS): PhysiologicalStatus {
  if (bpm < thresholds.heartRateMinWarning || bpm > thresholds.heartRateMaxWarning) {
    return 'ABNORMAL';
  }
  if (
    (bpm >= thresholds.heartRateMinWarning && bpm < thresholds.heartRateMinNormal) ||
    (bpm > thresholds.heartRateMaxNormal && bpm <= thresholds.heartRateMaxWarning)
  ) {
    return 'WARNING';
  }
  return 'NORMAL';
}

export function evaluateTemperatureStatus(temp: number, thresholds: VitalThresholds = DEFAULT_THRESHOLDS): PhysiologicalStatus {
  if (temp < thresholds.tempMinWarning || temp >= thresholds.tempMaxWarning + 0.1) {
    return 'ABNORMAL';
  }
  if (
    (temp >= thresholds.tempMinWarning && temp < thresholds.tempMinNormal) ||
    (temp > thresholds.tempMaxNormal && temp <= thresholds.tempMaxWarning)
  ) {
    return 'WARNING';
  }
  return 'NORMAL';
}

export function evaluateOverallStatus(
  hrStatus: PhysiologicalStatus,
  tempStatus: PhysiologicalStatus
): PhysiologicalStatus {
  if (hrStatus === 'ABNORMAL' || tempStatus === 'ABNORMAL') {
    return 'ABNORMAL';
  }
  if (hrStatus === 'WARNING' || tempStatus === 'WARNING') {
    return 'WARNING';
  }
  return 'NORMAL';
}
