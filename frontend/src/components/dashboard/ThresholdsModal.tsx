import React, { useState } from 'react';
import { Sliders, RotateCcw, Check, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VitalThresholds } from '@/types/vitals';
import { DEFAULT_THRESHOLDS } from '@/lib/thresholdEvaluator';

interface ThresholdsModalProps {
  thresholds: VitalThresholds;
  onUpdateThresholds: (thresholds: VitalThresholds) => void;
}

export const ThresholdsModal: React.FC<ThresholdsModalProps> = ({
  thresholds,
  onUpdateThresholds,
}) => {
  const [localThresholds, setLocalThresholds] = useState<VitalThresholds>(thresholds);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onUpdateThresholds(localThresholds);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    setLocalThresholds(DEFAULT_THRESHOLDS);
    onUpdateThresholds(DEFAULT_THRESHOLDS);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <Card className="p-6 bg-white max-w-3xl mx-auto shadow-sm">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-md bg-sky-100 text-clinical-blue flex items-center justify-center">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-navy-900">
              Clinical Demonstration Threshold Configuration
            </CardTitle>
            <CardDescription className="text-xs text-muted mt-0.5">
              Configurable parameter boundaries for demonstration classification (NORMAL, WARNING, ABNORMAL)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="p-3 mb-5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Academic Demonstration Notice:</strong> Thresholds configured here govern UI status badge evaluation and alert dispatching. In Phase 5, these values are synchronized dynamically with Firebase RTDB at <code>/thresholds/patient_01</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Heart Rate Thresholds */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="font-bold text-navy-900 text-sm flex items-center justify-between">
            <span>Heart Rate Limits</span>
            <span className="text-[11px] font-mono text-muted">BPM</span>
          </h4>

          <div>
            <label className="text-muted block font-medium">Normal Baseline Range (BPM):</label>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="number"
                value={localThresholds.heartRateMinNormal}
                onChange={(e) => setLocalThresholds({ ...localThresholds, heartRateMinNormal: Number(e.target.value) })}
                className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs"
              />
              <span className="text-muted">to</span>
              <input
                type="number"
                value={localThresholds.heartRateMaxNormal}
                onChange={(e) => setLocalThresholds({ ...localThresholds, heartRateMaxNormal: Number(e.target.value) })}
                className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-muted block font-medium">Low Warning Boundary (BPM):</label>
            <input
              type="number"
              value={localThresholds.heartRateMinWarning}
              onChange={(e) => setLocalThresholds({ ...localThresholds, heartRateMinWarning: Number(e.target.value) })}
              className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs mt-1"
            />
            <p className="text-[10px] text-muted mt-0.5">&lt; {localThresholds.heartRateMinWarning} triggers Abnormal Bradycardia alert</p>
          </div>

          <div>
            <label className="text-muted block font-medium">High Warning Boundary (BPM):</label>
            <input
              type="number"
              value={localThresholds.heartRateMaxWarning}
              onChange={(e) => setLocalThresholds({ ...localThresholds, heartRateMaxWarning: Number(e.target.value) })}
              className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs mt-1"
            />
            <p className="text-[10px] text-muted mt-0.5">&gt; {localThresholds.heartRateMaxWarning} triggers Abnormal Tachycardia alert</p>
          </div>
        </div>

        {/* Temperature Thresholds */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="font-bold text-navy-900 text-sm flex items-center justify-between">
            <span>Body Temperature Limits</span>
            <span className="text-[11px] font-mono text-muted">°C</span>
          </h4>

          <div>
            <label className="text-muted block font-medium">Normal Baseline Range (°C):</label>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="number"
                step="0.1"
                value={localThresholds.tempMinNormal}
                onChange={(e) => setLocalThresholds({ ...localThresholds, tempMinNormal: Number(e.target.value) })}
                className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs"
              />
              <span className="text-muted">to</span>
              <input
                type="number"
                step="0.1"
                value={localThresholds.tempMaxNormal}
                onChange={(e) => setLocalThresholds({ ...localThresholds, tempMaxNormal: Number(e.target.value) })}
                className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-muted block font-medium">Low Warning Boundary (°C):</label>
            <input
              type="number"
              step="0.1"
              value={localThresholds.tempMinWarning}
              onChange={(e) => setLocalThresholds({ ...localThresholds, tempMinWarning: Number(e.target.value) })}
              className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs mt-1"
            />
            <p className="text-[10px] text-muted mt-0.5">&lt; {localThresholds.tempMinWarning.toFixed(1)}°C triggers Hypothermia alert</p>
          </div>

          <div>
            <label className="text-muted block font-medium">High Warning Boundary (°C):</label>
            <input
              type="number"
              step="0.1"
              value={localThresholds.tempMaxWarning}
              onChange={(e) => setLocalThresholds({ ...localThresholds, tempMaxWarning: Number(e.target.value) })}
              className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs mt-1"
            />
            <p className="text-[10px] text-muted mt-0.5">&gt; {localThresholds.tempMaxWarning.toFixed(1)}°C triggers Hyperthermia alert</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset to Baseline
        </Button>

        <div className="flex items-center space-x-3">
          {savedNotice && (
            <span className="text-xs text-emerald-700 font-medium flex items-center">
              <Check className="h-3.5 w-3.5 mr-1" /> Demonstration Thresholds Updated
            </span>
          )}
          <Button size="sm" onClick={handleSave} className="text-xs">
            Save Thresholds
          </Button>
        </div>
      </div>
    </Card>
  );
};
