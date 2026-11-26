import { useState, useEffect, useCallback } from 'react';
import { AlertRecord } from '@/types/alerts';
import {
  subscribeToAlerts,
  acknowledgeAlert as apiAcknowledgeAlert,
  createAlert as apiCreateAlert,
  DEFAULT_PATIENT_ID,
} from '@/services/firebaseService';

export function useAlerts(patientId: string = DEFAULT_PATIENT_ID) {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAlerts(
      patientId,
      (data) => {
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useAlerts] Error subscribing to alerts:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [patientId]);

  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      try {
        // Optimistic UI update
        setAlerts((prev) =>
          prev.map((a) =>
            a.alertId === alertId
              ? { ...a, acknowledged: true, acknowledgedAt: Date.now() }
              : a
          )
        );
        await apiAcknowledgeAlert(patientId, alertId);
      } catch (err) {
        console.error('[useAlerts] Failed to acknowledge alert:', err);
        throw err;
      }
    },
    [patientId]
  );

  const createAlert = useCallback(
    async (alert: Omit<AlertRecord, 'acknowledged' | 'acknowledgedAt'>) => {
      try {
        await apiCreateAlert(patientId, alert);
      } catch (err) {
        console.error('[useAlerts] Failed to create alert:', err);
        throw err;
      }
    },
    [patientId]
  );

  const activeAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return {
    alerts,
    activeAlertCount,
    acknowledgeAlert,
    createAlert,
    loading,
    error,
  };
}
