import { useState, useEffect } from 'react';
import { ChartDataPoint } from '@/types/vitals';
import {
  subscribeToHistoricalVitals,
  DEFAULT_PATIENT_ID,
} from '@/services/firebaseService';

export function useHistory(
  patientId: string = DEFAULT_PATIENT_ID,
  limitCount: number = 30
) {
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToHistoricalVitals(
      patientId,
      limitCount,
      (data) => {
        setHistory(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useHistory] Error subscribing to history:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [patientId, limitCount]);

  return { history, loading, error };
}
