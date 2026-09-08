import React from 'react';
import { useUIStore, ActiveTab } from '../../store/useUIStore';
import { LayoutDashboard, AlertCircle, Bell, Terminal, Server } from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents';
import { useServiceHealth } from '../../hooks/useServiceHealth';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();
  const { data: incidents } = useIncidents();
  const { data: health, isLoading: isHealthLoading } = useServiceHealth();

  const openCount = incidents?.filter((i) => i.status === 'OPEN').length || 0;
  const totalCount = incidents?.length || 0;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'dashboard',
      label: 'Overview & Metrics',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'incidents',
      label: 'Incident Command Center',
      icon: <AlertCircle className="w-4 h-4" />,
      badge: openCount > 0 ? `${openCount} Open` : totalCount,
    },
    {
      id: 'alerts',
      label: 'Alert Ingestion Hub',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: 'telemetry',
      label: 'Log & Metric Explorer',
      icon: <Terminal className="w-4 h-4" />,
    },
  ];

  const services = [
    { name: 'Alert Service', port: ':8083', isUp: health?.alertService },
    { name: 'Incident Service', port: ':8084', isUp: health?.incidentService },
    { name: 'RCA Service', port: ':8085', isUp: health?.rcaService },
    { name: 'Log Service', port: ':8081', isUp: health?.logService },
    { name: 'Metric Service', port: ':8082', isUp: health?.metricService },
  ];

  const upCount = services.filter((s) => s.isUp).length;

  return (
    <aside className="w-64 bg-dark-surface/60 border-r border-dark-border flex flex-col shrink-0 p-4 min-h-[calc(100vh-61px)]">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 font-mono">
        Navigation
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-indigo-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    typeof item.badge === 'string' && item.badge.includes('Open')
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dynamic Services Health Card at Sidebar Bottom */}
      <div className="mt-auto pt-6">
        <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Microservices ({upCount}/5)
            </span>
            {isHealthLoading ? (
              <span className="text-amber-400 font-mono text-[10px] animate-pulse">CHECKING...</span>
            ) : upCount === 5 ? (
              <span className="text-emerald-400 font-mono text-[10px] font-bold">ALL UP</span>
            ) : upCount > 0 ? (
              <span className="text-amber-400 font-mono text-[10px] font-bold">{upCount}/5 UP</span>
            ) : (
              <span className="text-rose-400 font-mono text-[10px] font-bold">ALL DOWN</span>
            )}
          </div>

          {/* Individual Service Status Badges */}
          <div className="space-y-1.5 text-[11px] font-mono">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      svc.isUp ? 'bg-emerald-500 shadow-glow-emerald' : 'bg-rose-500'
                    }`}
                  />
                  <span>{svc.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-[10px]">{svc.port}</span>
                  <span
                    className={`px-1 py-0.2 rounded text-[9px] font-bold uppercase ${
                      svc.isUp
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                    }`}
                  >
                    {svc.isUp ? 'UP' : 'DOWN'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
