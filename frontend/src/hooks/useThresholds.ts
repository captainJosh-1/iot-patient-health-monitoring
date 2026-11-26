import { useState, useEffect, useCallback } from 'react';
import { VitalThresholds } from '@/types/vitals';
import { DEFAULT_THRESHOLDS } from '@/lib/thresholdEvaluator';
import {
  subscribeToThresholds,
  updateThresholds as apiUpdateThresholds,
  DEFAULT_PATIENT_ID,
} from '@/services/firebaseService';

export function useThresholds(patientId: string = DEFAULT_PATIENT_ID) {
  const [thresholds, setThresholds] = useState<VitalThresholds>(DEFAULT_THRESHOLDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToThresholds(
      patientId,
      (data) => {
        if (data) {
          setThresholds(data);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useThresholds] Error subscribing to thresholds:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [patientId]);

  const saveThresholds = useCallback(
    async (newThresholds: VitalThresholds) => {
      try {
        setThresholds(newThresholds);
        await apiUpdateThresholds(patientId, newThresholds);
      } catch (err) {
        console.error('[useThresholds] Failed to update thresholds:', err);
        throw err;
      }
    },
    [patientId]
  );

  return { thresholds, saveThresholds, loading, error };
}
