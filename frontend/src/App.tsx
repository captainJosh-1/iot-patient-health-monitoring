import React, { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { usePatient } from '@/hooks/usePatient';
import { useDevice } from '@/hooks/useDevice';
import { DEFAULT_PATIENT_ID, DEFAULT_DEVICE_ID } from '@/services/firebaseService';

const AuthenticatedDashboard: React.FC = () => {
  const [alertCount, setAlertCount] = useState(0);
  const { patient } = usePatient(DEFAULT_PATIENT_ID);
  const { device } = useDevice(DEFAULT_DEVICE_ID);

  const lastUpdated = device.lastSeen > 0 ? device.lastSeen : Date.now();

  return (
    <DashboardLayout
      patient={patient}
      device={device}
      lastUpdated={lastUpdated}
      alertCount={alertCount}
    >
      {(activeTab) => (
        <DashboardPage
          activeTab={activeTab}
          onAlertCountChange={setAlertCount}
        />
      )}
    </DashboardLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AuthenticatedDashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default App;
