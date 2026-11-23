import React, { useState } from 'react';
import { Wifi, UserCheck, Shield, Clock, LogOut, Loader2 } from 'lucide-react';
import { PatientProfile, DoctorProfile } from '@/types/patient';
import { DeviceTelemetry } from '@/types/device';
import { formatTime } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface TopNavProps {
  pageTitle: string;
  patient: PatientProfile;
  doctor?: DoctorProfile;
  device: DeviceTelemetry;
  lastUpdated: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  pageTitle,
  patient,
  device,
  lastUpdated,
}) => {
  const { currentUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Authenticated doctor identity directly from Firebase Auth (no fictional identities)
  const doctorDisplayName = currentUser?.displayName || currentUser?.email || 'Attending Physician';
  const doctorEmail = currentUser?.email || 'Authorized Doctor';
  const doctorSubtitle = currentUser?.displayName ? doctorEmail : 'Attending Physician';

  const initials = currentUser?.displayName
    ? currentUser.displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : (currentUser?.email?.[0]?.toUpperCase() || 'DR');

  return (
    <header className="h-16 bg-surface border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
      {/* Page Title & Patient Quick Chip */}
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-base font-bold text-navy-900 tracking-tight">{pageTitle}</h2>
          <div className="flex items-center space-x-2 text-xs text-muted">
            <span>Bedside Unit</span>
            <span>•</span>
            <span className="font-medium text-navy-800">{patient.roomBed}</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* Patient Pill */}
        <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs">
          <UserCheck className="h-3.5 w-3.5 text-clinical-blue" />
          <span className="font-semibold text-navy-900">{patient.fullName}</span>
          <span className="text-slate-400">|</span>
          <span className="font-mono text-muted text-[11px]">{patient.patientId}</span>
        </div>
      </div>

      {/* Device Status, Authenticated Doctor Profile & Logout */}
      <div className="flex items-center space-x-4 md:space-x-5">
        {/* Telemetry Freshness & Device Pill */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            <Clock className="h-3.5 w-3.5 text-muted" />
            <span className="text-muted">Ingested:</span>
            <span className="font-mono font-medium text-navy-900">{formatTime(lastUpdated)}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
            <Wifi className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-medium font-mono text-[11px]">ESP8266: {device.status}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Authenticated Doctor Identity from Firebase Auth */}
        <div className="flex items-center space-x-3">
          <div
            className="h-8 w-8 rounded-full bg-navy-800 text-white font-bold text-xs flex items-center justify-center border border-navy-700 shadow-sm shrink-0"
            title={doctorEmail}
          >
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-navy-900 flex items-center space-x-1">
              <span className="truncate max-w-[170px]" title={doctorDisplayName}>{doctorDisplayName}</span>
              <Shield className="h-3 w-3 text-clinical-blue inline shrink-0" />
            </div>
            <p className="text-[11px] text-muted truncate max-w-[170px]" title={doctorSubtitle}>
              {doctorSubtitle}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign out of clinical dashboard"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-status-abnormal-text hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
