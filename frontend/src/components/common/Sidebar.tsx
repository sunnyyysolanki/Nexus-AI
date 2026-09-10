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
      label: 'Incident Command',
      icon: <AlertCircle className="w-4 h-4" />,
      badge: openCount > 0 ? `${openCount} Open` : totalCount,
    },
    {
      id: 'alerts',
      label: 'Alert Ingestion',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: 'telemetry',
      label: 'Telemetry Explorer',
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
    <aside className="w-64 bg-dark-bg border-r border-dark-border flex flex-col shrink-0 p-3 min-h-[calc(100vh-61px)]">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-3 mb-2 font-mono">
        Navigation
      </div>

      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-xs transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-zinc-100' : 'text-zinc-500'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                    typeof item.badge === 'string' && item.badge.includes('Open')
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-zinc-800 text-zinc-400'
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
        <div className="p-3 border-t border-dark-border text-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Server className="w-3.5 h-3.5 text-zinc-500" />
              Microservices ({upCount}/5)
            </span>
            {isHealthLoading ? (
              <span className="text-amber-500 animate-pulse">CHECKING...</span>
            ) : upCount === 5 ? (
              <span className="text-emerald-500 font-medium">ALL UP</span>
            ) : upCount > 0 ? (
              <span className="text-amber-500 font-medium">{upCount}/5 UP</span>
            ) : (
              <span className="text-rose-500 font-medium">ALL DOWN</span>
            )}
          </div>

          {/* Individual Service Status Badges */}
          <div className="space-y-2 text-[11px] font-mono">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      svc.isUp ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span>{svc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-[10px]">{svc.port}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
