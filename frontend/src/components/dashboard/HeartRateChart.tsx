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
import { Activity } from 'lucide-react';

interface HeartRateChartProps {
  data: ChartDataPoint[];
  currentBpm: number;
}

export const HeartRateChart: React.FC<HeartRateChartProps> = ({ data, currentBpm }) => {
  return (
    <Card className="p-5 bg-white">
      <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-rose-500" />
            <CardTitle className="text-sm font-bold text-navy-900">Heart Rate Trend (BPM)</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted mt-1">
            Real-time continuous optical photoplethysmography (PPG) over time
          </CardDescription>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-muted">Current: </span>
          <span className="font-mono font-bold text-sm text-navy-900">{currentBpm} BPM</span>
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
              domain={[45, 125]}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 10 }}
              unit=" bpm"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-navy-900 text-white px-3 py-2 rounded-md shadow-lg text-xs font-mono border border-navy-800">
                      <p className="text-slate-400 text-[10px]">{label}</p>
                      <p className="font-bold text-rose-400 text-sm mt-0.5">
                        {payload[0].value} <span className="text-xs font-normal text-slate-300">BPM</span>
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
              y={100}
              stroke="#d97706"
              strokeDasharray="4 4"
              label={{ value: 'Max Normal (100)', fill: '#d97706', fontSize: 9, position: 'insideTopRight' }}
            />
            <ReferenceLine
              y={60}
              stroke="#0284c7"
              strokeDasharray="4 4"
              label={{ value: 'Min Normal (60)', fill: '#0284c7', fontSize: 9, position: 'insideBottomRight' }}
            />

            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="#e11d48"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#e11d48', stroke: '#ffffff', strokeWidth: 2 }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-rose-600 inline-block" />
            <span>Measured BPM</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-0.5 w-3 bg-amber-500 inline-block" />
            <span>Threshold Bounds (60–100)</span>
          </span>
        </div>
        <span className="font-mono text-slate-400 text-[10px]">Window: Last 30 Telemetry Samples</span>
      </div>
    </Card>
  );
};
