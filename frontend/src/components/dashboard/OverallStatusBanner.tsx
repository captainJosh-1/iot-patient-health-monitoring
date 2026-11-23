import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PhysiologicalStatus } from '@/types/vitals';
import { cn } from '@/lib/utils';

interface OverallStatusBannerProps {
  status: PhysiologicalStatus;
  heartRate: number;
  temperature: number;
}

export const OverallStatusBanner: React.FC<OverallStatusBannerProps> = ({
  status,
  heartRate,
  temperature,
}) => {
  const getBannerDetails = () => {
    switch (status) {
      case 'NORMAL':
        return {
          icon: ShieldCheck,
          title: 'All Physiological Parameters Within Stable Baseline',
          description: `Current vitals (Heart Rate: ${heartRate} BPM, Temperature: ${temperature.toFixed(1)} °C) conform strictly to normal demonstration clinical criteria. No immediate clinical intervention required.`,
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          containerClass: 'bg-emerald-50/50 border-emerald-200',
          iconColor: 'text-emerald-600',
        };
      case 'WARNING':
        return {
          icon: AlertTriangle,
          title: 'Physiological Warning: Parameter Approaching Clinical Margin',
          description: `One or more vitals are borderline (Heart Rate: ${heartRate} BPM, Temperature: ${temperature.toFixed(1)} °C). Continuous patient observation recommended.`,
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
          containerClass: 'bg-amber-50/60 border-amber-200',
          iconColor: 'text-amber-600',
        };
      case 'ABNORMAL':
        return {
          icon: AlertOctagon,
          title: 'Acute Clinical Anomaly Detected: Immediate Attention Required',
          description: `Critical threshold violation detected (Heart Rate: ${heartRate} BPM, Temperature: ${temperature.toFixed(1)} °C). Please evaluate sensor contact and verify patient condition immediately.`,
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
          containerClass: 'bg-rose-50/70 border-rose-200',
          iconColor: 'text-rose-600',
        };
    }
  };

  const details = getBannerDetails();
  const Icon = details.icon;

  return (
    <Card className={cn("p-4 border", details.containerClass)}>
      <div className="flex items-start space-x-3.5">
        <div className={cn("p-2 rounded-md bg-white border border-slate-200 shadow-xs shrink-0", details.iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-navy-900">{details.title}</h4>
            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", details.badgeClass)}>
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {details.description}
          </p>
        </div>
      </div>
    </Card>
  );
};
