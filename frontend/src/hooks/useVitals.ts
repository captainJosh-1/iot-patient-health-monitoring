import { useState, useEffect } from 'react';
import { VitalReading } from '@/types/vitals';
import { subscribeToLatestVitals, DEFAULT_PATIENT_ID } from '@/services/firebaseService';

export function useVitals(patientId: string = DEFAULT_PATIENT_ID) {
  const [vitals, setVitals] = useState<VitalReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToLatestVitals(
      patientId,
      (data) => {
        setVitals(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useVitals] Error subscribing to vitals:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [patientId]);

  return { vitals, loading, error };
}
