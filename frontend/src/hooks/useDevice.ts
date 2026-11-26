import { useState, useEffect } from 'react';
import { DeviceTelemetry, ConnectivityStatus } from '@/types/device';
import { subscribeToDevice, DEFAULT_DEVICE_ID } from '@/services/firebaseService';

const DEFAULT_STANDBY_DEVICE: DeviceTelemetry = {
  deviceId: DEFAULT_DEVICE_ID,
  hardwareModel: 'NodeMCU ESP-12E (Tensilica L106 @ 80MHz)',
  firmwareVersion: 'v1.0.0-academic',
  macAddress: 'N/A',
  ipAddress: 'Awaiting Connection',
  rssi: 0,
  uptimeSeconds: 0,
  lastSeen: 0,
  status: 'DISCONNECTED',
  wifiSsid: 'Academic_IoT_WLAN',
};

export function useDevice(deviceId: string = DEFAULT_DEVICE_ID) {
  const [rawDevice, setRawDevice] = useState<DeviceTelemetry | null>(null);
  const [secondsSinceLastSeen, setSecondsSinceLastSeen] = useState<number>(999);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to RTDB /devices/{deviceId}
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToDevice(
      deviceId,
      (data) => {
        setRawDevice(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useDevice] Error subscribing to device:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceId]);

  // Periodic interval check (runs every 1 second)
  // Computes secondsSinceLastSeen and automatically flips to OFFLINE if > 30000 ms
  useEffect(() => {
    const calculateSeconds = () => {
      if (!rawDevice || !rawDevice.lastSeen || rawDevice.lastSeen === 0) {
        setSecondsSinceLastSeen(999);
        return;
      }
      const elapsed = Math.max(0, Math.floor((Date.now() - rawDevice.lastSeen) / 1000));
      setSecondsSinceLastSeen(elapsed);
    };

    calculateSeconds();
    const interval = setInterval(calculateSeconds, 1000);
    return () => clearInterval(interval);
  }, [rawDevice]);

  // Derived connectivity status based on 30-second stale heartbeat threshold
  const computedStatus: ConnectivityStatus = (() => {
    if (!rawDevice || rawDevice.lastSeen === 0 || secondsSinceLastSeen > 30) {
      return 'DISCONNECTED';
    }
    if (secondsSinceLastSeen > 15) {
      return 'DEGRADED';
    }
    return 'ONLINE';
  })();

  const device: DeviceTelemetry = rawDevice
    ? { ...rawDevice, status: computedStatus }
    : { ...DEFAULT_STANDBY_DEVICE, status: computedStatus };

  return {
    device,
    rawDevice,
    secondsSinceLastSeen,
    isOffline: computedStatus === 'DISCONNECTED',
    status: computedStatus,
    loading,
    error,
  };
}
