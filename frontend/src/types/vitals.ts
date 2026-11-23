export type PhysiologicalStatus = 'NORMAL' | 'WARNING' | 'ABNORMAL';

export interface VitalReading {
  heartRate: number; // Beats Per Minute (BPM)
  temperature: number; // Degrees Celsius (°C)
  timestamp: number; // Epoch milliseconds
  status: PhysiologicalStatus;
  deviceId: string;
}

export interface VitalThresholds {
  heartRateMinNormal: number; // Default 60
  heartRateMaxNormal: number; // Default 100
  heartRateMinWarning: number; // Default 50 (50-59 is Warning)
  heartRateMaxWarning: number; // Default 115 (101-115 is Warning)
  tempMinNormal: number; // Default 35.0
  tempMaxNormal: number; // Default 38.0
  tempMinWarning: number; // Default 34.0 (34.0-34.9 is Warning)
  tempMaxWarning: number; // Default 38.9 (38.1-38.9 is Warning)
}

export interface ChartDataPoint {
  timeLabel: string;
  timestamp: number;
  heartRate: number;
  temperature: number;
  status: PhysiologicalStatus;
}
