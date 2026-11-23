import React, { useState } from 'react';
import { Bell, Check, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertRecord } from '@/types/alerts';
import { formatTime } from '@/lib/utils';

interface AlertsFeedProps {
  alerts: AlertRecord[];
  onAcknowledgeAlert?: (alertId: string) => void;
}

export const AlertsFeed: React.FC<AlertsFeedProps> = ({
  alerts,
  onAcknowledgeAlert,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNACKNOWLEDGED'>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'UNACKNOWLEDGED') return !a.acknowledged;
    return true;
  });

  return (
    <Card className="p-5 bg-white">
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-bold text-navy-900">Recent Clinical Alerts</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted mt-0.5">
            Demonstration threshold violations and anomaly audit trail
          </CardDescription>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-0.5 rounded-md text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2 py-0.5 rounded font-medium text-[11px] transition-all ${
              filter === 'ALL' ? 'bg-white text-navy-900 shadow-xs' : 'text-muted hover:text-navy-900'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('UNACKNOWLEDGED')}
            className={`px-2 py-0.5 rounded font-medium text-[11px] transition-all ${
              filter === 'UNACKNOWLEDGED' ? 'bg-white text-navy-900 shadow-xs' : 'text-muted hover:text-navy-900'
            }`}
          >
            Active ({alerts.filter(a => !a.acknowledged).length})
          </button>
        </div>
      </CardHeader>

      <div className="space-y-2.5 mt-2">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">
            <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            No active threshold alerts. Patient vitals remain stable.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.alertId}
              className={`p-3 rounded-lg border text-xs transition-all flex items-start justify-between gap-3 ${
                alert.acknowledged
                  ? 'bg-slate-50/70 border-slate-200 opacity-70'
                  : alert.severity === 'ABNORMAL'
                  ? 'bg-rose-50/60 border-rose-200 shadow-xs'
                  : 'bg-amber-50/60 border-amber-200 shadow-xs'
              }`}
            >
              <div className="flex items-start space-x-2.5">
                <div className="mt-0.5 shrink-0">
                  {alert.severity === 'ABNORMAL' ? (
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-navy-900">{alert.parameterLabel}</span>
                    <span className="font-mono font-bold text-navy-800">
                      {alert.value} {alert.unit}
                    </span>
                    <Badge
                      variant={alert.severity === 'ABNORMAL' ? 'abnormal' : 'warning'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {alert.severity}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    {alert.message}
                  </p>

                  <div className="flex items-center space-x-2 text-[10px] text-muted mt-1.5 font-mono">
                    <span>{formatTime(alert.timestamp)}</span>
                    {alert.acknowledged && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-sans font-medium flex items-center">
                          <Check className="h-3 w-3 mr-0.5" /> Reviewed by Physician
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!alert.acknowledged && onAcknowledgeAlert && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAcknowledgeAlert(alert.alertId)}
                  className="text-[11px] h-7 px-2.5 shrink-0 hover:bg-white hover:text-emerald-700 hover:border-emerald-300"
                >
                  <Check className="h-3 w-3 mr-1" /> Ack
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
