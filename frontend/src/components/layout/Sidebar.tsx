import React from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  HeartPulse, 
  Bell, 
  Sliders, 
  Cpu,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'overview' | 'monitoring' | 'alerts' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, alertCount = 0 }) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring' as NavTab, label: 'Patient Monitoring', icon: HeartPulse, badge: 'Live' },
    { id: 'alerts' as NavTab, label: 'Alerts', icon: Bell, count: alertCount },
    { id: 'settings' as NavTab, label: 'Threshold Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-navy-900 text-slate-300 flex flex-col shrink-0 border-r border-navy-800 select-none">
      {/* Branding Header */}
      <div className="p-5 border-b border-navy-800 flex items-center space-x-3">
        <div className="h-9 w-9 rounded-md bg-clinical-blue flex items-center justify-center text-white shadow-sm">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">PulseCare IoT</h1>
          <p className="text-[11px] text-slate-400 font-medium">Bedside Telemetry Suite</p>
        </div>
      </div>

      {/* Hardware Node Status Indicator in Sidebar */}
      <div className="px-4 py-3 mx-3 mt-4 rounded-lg bg-navy-800/60 border border-navy-700/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Cpu className="h-4 w-4 text-clinical-teal" />
          <span className="text-slate-300 font-mono text-[11px]">NodeMCU ESP8266</span>
        </div>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Clinical Oversight
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all group",
                isActive 
                  ? "bg-clinical-blue text-white shadow-sm font-semibold" 
                  : "text-slate-300 hover:bg-navy-800 hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-mono font-medium",
                  isActive ? "bg-white/20 text-white" : "bg-clinical-blue/20 text-clinical-blue"
                )}>
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && item.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-status-warning-bg text-status-warning-text font-bold">
                  {item.count}
                </span>
              )}

              {isActive && !item.badge && !item.count && (
                <ChevronRight className="h-3.5 w-3.5 text-white/70" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Scope Safeguard Badge */}
      <div className="p-4 border-t border-navy-800">
        <div className="p-3 rounded-md bg-navy-800/40 border border-navy-700/40 text-[11px] text-slate-400 flex items-start space-x-2">
          <ShieldCheck className="h-4 w-4 text-clinical-blue shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-300">Single-Patient Scope</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Prototype Model: 1 Doctor • 1 Patient • 1 ESP8266</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
