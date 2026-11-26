import { useState, useEffect } from 'react';
import { PatientProfile } from '@/types/patient';
import {
  subscribeToPatient,
  DEFAULT_PATIENT_ID,
  DEFAULT_DEVICE_ID,
} from '@/services/firebaseService';

export const DEFAULT_FALLBACK_PATIENT: PatientProfile = {
  patientId: DEFAULT_PATIENT_ID,
  fullName: 'Eleanor Vance',
  age: 64,
  gender: 'Female',
  admissionDate: '2026-11-15',
  roomBed: 'Telemetry Suite B-12',
  assignedDeviceId: DEFAULT_DEVICE_ID,
  assignedDoctor: 'Dr. Sarah Jenkins, MD',
};

export function usePatient(patientId: string = DEFAULT_PATIENT_ID) {
  const [rawPatient, setRawPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPatient(
      patientId,
      (data) => {
        setRawPatient(data);
        setLoading(false);
      },
      (err) => {
        console.error('[usePatient] Error subscribing to patient:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [patientId]);

  const patient = rawPatient || DEFAULT_FALLBACK_PATIENT;

  return { patient, rawPatient, loading, error };
}
