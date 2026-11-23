import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { TopNav } from './TopNav';
import { PatientProfile, DoctorProfile } from '@/types/patient';
import { DeviceTelemetry } from '@/types/device';

interface DashboardLayoutProps {
  children: (activeTab: NavTab) => React.ReactNode;
  patient: PatientProfile;
  doctor: DoctorProfile;
  device: DeviceTelemetry;
  lastUpdated: number;
  alertCount?: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  patient,
  doctor,
  device,
  lastUpdated,
  alertCount = 0,
}) => {
  const [activeTab, setActiveTab] = useState<NavTab>('monitoring');

  const tabTitles: Record<NavTab, string> = {
    overview: 'Clinical Overview',
    monitoring: 'Patient Telemetry Monitoring',
    alerts: 'Clinical Alerts Audit Log',
    settings: 'Demonstration Threshold Configuration',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} alertCount={alertCount} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          pageTitle={tabTitles[activeTab]}
          patient={patient}
          doctor={doctor}
          device={device}
          lastUpdated={lastUpdated}
        />

        {/* Dynamic View Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {children(activeTab)}
        </main>
      </div>
    </div>
  );
};
