import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { DEMO_PATIENT, DEMO_DOCTOR, DEMO_DEVICE } from '@/data/mockData';

export const App: React.FC = () => {
  const [alertCount, setAlertCount] = useState(1);
  const [lastUpdated] = useState(Date.now());

  return (
    <DashboardLayout
      patient={DEMO_PATIENT}
      doctor={DEMO_DOCTOR}
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

export default App;
