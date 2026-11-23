import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartDataPoint } from '@/types/vitals';
import { Thermometer } from 'lucide-react';

interface TemperatureChartProps {
  data: ChartDataPoint[];
  currentTemp: number;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ data, currentTemp }) => {
  return (
    <Card className="p-5 bg-white">
      <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-clinical-teal" />
            <CardTitle className="text-sm font-bold text-navy-900">Body Temperature Trend (°C)</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted mt-1">
            Continuous contact thermal monitoring via Dallas DS18B20 digital probe
          </CardDescription>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-muted">Current: </span>
          <span className="font-mono font-bold text-sm text-navy-900">{currentTemp.toFixed(1)} °C</span>
        </div>
      </CardHeader>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="timeLabel"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[33.5, 40.0]}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 10 }}
              unit=" °C"
              tickFormatter={(v) => v.toFixed(1)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-navy-900 text-white px-3 py-2 rounded-md shadow-lg text-xs font-mono border border-navy-800">
                      <p className="text-slate-400 text-[10px]">{label}</p>
                      <p className="font-bold text-teal-400 text-sm mt-0.5">
                        {Number(payload[0].value).toFixed(1)} <span className="text-xs font-normal text-slate-300">°C</span>
                      </p>
                      <p className="text-[10px] text-slate-300 mt-0.5">
                        Status: <span className="font-semibold text-white">{payload[0].payload.status}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Normal Range Reference Lines */}
            <ReferenceLine
              y={38.0}
              stroke="#d97706"
              strokeDasharray="4 4"
              label={{ value: 'Max Normal (38.0°C)', fill: '#d97706', fontSize: 9, position: 'insideTopRight' }}
            />
            <ReferenceLine
              y={35.0}
              stroke="#0284c7"
              strokeDasharray="4 4"
              label={{ value: 'Min Normal (35.0°C)', fill: '#0284c7', fontSize: 9, position: 'insideBottomRight' }}
            />

            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#0d9488"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-teal-600 inline-block" />
            <span>Temperature (°C)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-0.5 w-3 bg-amber-500 inline-block" />
            <span>Demonstration Limits (35.0–38.0°C)</span>
          </span>
        </div>
        <span className="font-mono text-slate-400 text-[10px]">Window: Last 30 Telemetry Samples</span>
      </div>
    </Card>
  );
};
