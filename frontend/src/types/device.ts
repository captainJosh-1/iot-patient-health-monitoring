export type ConnectivityStatus = 'ONLINE' | 'DEGRADED' | 'DISCONNECTED';

export interface DeviceTelemetry {
  deviceId: string;
  hardwareModel: string;
  firmwareVersion: string;
  macAddress: string;
  ipAddress: string;
  rssi: number; // dBm
  uptimeSeconds: number;
  lastSeen: number; // Epoch milliseconds
  status: ConnectivityStatus;
  wifiSsid: string;
}
