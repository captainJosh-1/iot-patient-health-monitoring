import React, { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { DEMO_PATIENT, DEMO_DEVICE } from '@/data/mockData';

const AuthenticatedDashboard: React.FC = () => {
  const [alertCount, setAlertCount] = useState(1);
  const [lastUpdated] = useState(Date.now());

  return (
    <DashboardLayout
      patient={DEMO_PATIENT}
      device={DEMO_DEVICE}
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
