import React from 'react';
import { Heart, Thermometer, LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhysiologicalStatus } from '@/types/vitals';
import { cn } from '@/lib/utils';

interface VitalCardProps {
  title: string;
  value: number;
  unit: string;
  status: PhysiologicalStatus;
  normalRange: string;
  sensorName: string;
  pinMapping: string;
  iconType: 'heart' | 'temp';
  deltaText?: string;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  title,
  value,
  unit,
  status,
  normalRange,
  sensorName,
  pinMapping,
  iconType,
  deltaText,
}) => {
  const Icon: LucideIcon = iconType === 'heart' ? Heart : Thermometer;

  const getStatusBadge = () => {
    switch (status) {
      case 'NORMAL':
        return <Badge variant="normal" dot>Normal</Badge>;
      case 'WARNING':
        return <Badge variant="warning" dot>Warning</Badge>;
      case 'ABNORMAL':
        return <Badge variant="abnormal" dot>Abnormal</Badge>;
    }
  };

  const getBorderHighlight = () => {
    switch (status) {
      case 'NORMAL':
        return 'border-l-4 border-l-status-normal-dot';
      case 'WARNING':
        return 'border-l-4 border-l-status-warning-dot';
      case 'ABNORMAL':
        return 'border-l-4 border-l-status-abnormal-dot';
    }
  };

  return (
    <Card className={cn("p-5 bg-white relative overflow-hidden transition-all", getBorderHighlight())}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center",
            iconType === 'heart' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
            <p className="text-[11px] text-slate-400 font-mono">{sensorName} ({pinMapping})</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Main Metric Value */}
      <div className="mt-4 flex items-baseline space-x-2">
        <span className="text-4xl font-bold font-mono text-navy-900 tracking-tight">
          {iconType === 'temp' ? value.toFixed(1) : value}
        </span>
        <span className="text-base font-semibold text-muted">{unit}</span>

        {deltaText && (
          <span className="text-xs text-slate-500 font-medium ml-2">
            ({deltaText})
          </span>
        )}
      </div>

      {/* Baseline Reference & Threshold Limits */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-muted">
        <span>Target Baseline:</span>
        <span className="font-mono font-medium text-navy-800">{normalRange}</span>
      </div>
    </Card>
  );
};
