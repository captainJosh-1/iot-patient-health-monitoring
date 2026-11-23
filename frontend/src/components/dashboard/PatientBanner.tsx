import React from 'react';
import { User, Calendar, Bed, Cpu, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PatientProfile } from '@/types/patient';
import { PhysiologicalStatus } from '@/types/vitals';

interface PatientBannerProps {
  patient: PatientProfile;
  overallStatus: PhysiologicalStatus;
  lastUpdated: number;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  overallStatus,
}) => {
  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'NORMAL':
        return (
          <Badge variant="normal" dot className="px-3 py-1 text-xs uppercase font-bold tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Normal Status
          </Badge>
        );
      case 'WARNING':
        return (
          <Badge variant="warning" dot className="px-3 py-1 text-xs uppercase font-bold tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Clinical Warning
          </Badge>
        );
      case 'ABNORMAL':
        return (
          <Badge variant="abnormal" dot className="px-3 py-1 text-xs uppercase font-bold tracking-wider">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Abnormal Alert
          </Badge>
        );
    }
  };

  return (
    <Card className="p-5 border-slate-200 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Patient Identity */}
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-lg bg-sky-100 text-clinical-blue flex items-center justify-center shrink-0 border border-sky-200">
            <User className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-navy-900 tracking-tight">{patient.fullName}</h2>
              {getStatusBadge()}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted">
              <span><strong>Age:</strong> {patient.age} yrs</span>
              <span>•</span>
              <span><strong>Gender:</strong> {patient.gender}</span>
              <span>•</span>
              <span><strong>Patient ID:</strong> <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-navy-800">{patient.patientId}</code></span>
            </div>
          </div>
        </div>

        {/* Clinical Location & Device Mapping */}
        <div className="flex flex-wrap items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center space-x-1.5 text-muted">
              <Bed className="h-3.5 w-3.5 text-clinical-blue" />
              <span className="font-medium text-slate-500">Location</span>
            </div>
            <p className="font-semibold text-navy-900 mt-0.5">{patient.roomBed}</p>
          </div>

          <div className="px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center space-x-1.5 text-muted">
              <Cpu className="h-3.5 w-3.5 text-clinical-teal" />
              <span className="font-medium text-slate-500">Telemetry Unit</span>
            </div>
            <p className="font-mono font-semibold text-navy-900 mt-0.5">{patient.assignedDeviceId}</p>
          </div>

          <div className="px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs hidden lg:block">
            <div className="flex items-center space-x-1.5 text-muted">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium text-slate-500">Admitted</span>
            </div>
            <p className="font-semibold text-navy-900 mt-0.5">{patient.admissionDate}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
