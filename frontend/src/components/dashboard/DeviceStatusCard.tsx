import React from 'react';
import { Cpu, Wifi, Radio, Server, ShieldCheck, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeviceTelemetry } from '@/types/device';
import { formatTime, formatUptime } from '@/lib/utils';

interface DeviceStatusCardProps {
  device: DeviceTelemetry;
  secondsSinceLastSeen: number;
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({
  device,
  secondsSinceLastSeen,
}) => {
  const getStatusBadge = () => {
    if (secondsSinceLastSeen > 30) {
      return (
        <Badge variant="abnormal" dot className="font-mono">
          DISCONNECTED ({secondsSinceLastSeen}s ago)
        </Badge>
      );
    }
    if (secondsSinceLastSeen > 15) {
      return (
        <Badge variant="warning" dot className="font-mono">
          HIGH LATENCY ({secondsSinceLastSeen}s)
        </Badge>
      );
    }
    return (
      <Badge variant="normal" dot className="font-mono">
        ONLINE ({secondsSinceLastSeen}s ago)
      </Badge>
    );
  };

  return (
    <Card className="p-5 bg-white">
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-clinical-teal" />
            <CardTitle className="text-sm font-bold text-navy-900">Hardware Telemetry Unit</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted mt-0.5">
            NodeMCU ESP8266 (ESP-12E) edge microcontroller telemetry
          </CardDescription>
        </div>
        {getStatusBadge()}
      </CardHeader>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs">
        {/* Device ID */}
        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-muted text-[11px]">
            <Server className="h-3 w-3 text-clinical-blue" />
            <span>Device ID</span>
          </div>
          <p className="font-mono font-bold text-navy-900 mt-1">{device.deviceId}</p>
        </div>

        {/* IP Address */}
        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-muted text-[11px]">
            <Radio className="h-3 w-3 text-clinical-teal" />
            <span>Local IP</span>
          </div>
          <p className="font-mono font-semibold text-navy-900 mt-1">{device.ipAddress}</p>
        </div>

        {/* Wi-Fi RSSI */}
        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-muted text-[11px]">
            <Wifi className="h-3 w-3 text-emerald-600" />
            <span>Wi-Fi Signal</span>
          </div>
          <p className="font-mono font-semibold text-navy-900 mt-1">
            {device.rssi} dBm <span className="text-[10px] text-slate-500 font-sans">(Good)</span>
          </p>
        </div>

        {/* Last Heartbeat */}
        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-muted text-[11px]">
            <Clock className="h-3 w-3 text-slate-500" />
            <span>Last Heartbeat</span>
          </div>
          <p className="font-mono font-semibold text-navy-900 mt-1">{formatTime(device.lastSeen)}</p>
        </div>

        {/* System Uptime */}
        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-muted text-[11px]">
            <ShieldCheck className="h-3 w-3 text-indigo-600" />
            <span>Continuous Uptime</span>
          </div>
          <p className="font-mono font-semibold text-navy-900 mt-1">{formatUptime(device.uptimeSeconds)}</p>
        </div>

        {/* MAC Address */}
        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-muted text-[11px]">
            <Cpu className="h-3 w-3 text-slate-500" />
            <span>MAC Hardware</span>
          </div>
          <p className="font-mono text-[11px] font-semibold text-navy-800 mt-1 truncate">{device.macAddress}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Firmware: <code className="font-mono font-medium text-slate-700">{device.firmwareVersion}</code></span>
        <span className="font-mono text-[10px] text-muted">Cloud Region: Singapore (asia-southeast1)</span>
      </div>
    </Card>
  );
};
