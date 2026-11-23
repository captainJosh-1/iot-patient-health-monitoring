import { PhysiologicalStatus } from './vitals';

export interface AlertRecord {
  alertId: string;
  patientId: string;
  parameter: 'HEART_RATE' | 'TEMPERATURE';
  parameterLabel: string;
  value: number;
  unit: string;
  severity: PhysiologicalStatus; // 'WARNING' | 'ABNORMAL'
  message: string;
  timestamp: number;
  acknowledged: boolean;
  acknowledgedAt?: number;
}
