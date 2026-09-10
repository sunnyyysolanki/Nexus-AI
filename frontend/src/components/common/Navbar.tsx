import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { BellPlus, Activity, RefreshCw, Zap } from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents';
import { useServiceHealth } from '../../hooks/useServiceHealth';

export const Navbar: React.FC = () => {
  const { setAlertModalOpen, autoRefresh, toggleAutoRefresh } = useUIStore();
  const { data: incidents, isFetching, refetch } = useIncidents();
  const { data: health, isLoading: isHealthLoading } = useServiceHealth();

  const openIncidentsCount = incidents?.filter((i) => i.status === 'OPEN').length || 0;
  const isGatewayUp = health?.gateway;

  return (
    <header className="sticky top-0 z-40 bg-dark-bg border-b border-dark-border px-5 py-3 flex items-center justify-between">
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md border border-zinc-700 bg-zinc-800 flex items-center justify-center">
            <Zap className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-zinc-100 tracking-tight">
                NEXUS<span className="text-zinc-400 font-medium ml-0.5">AI</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                v1.0.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Observability Engine</p>
          </div>
        </div>

        {/* Dynamic Gateway Connection Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-dark-border text-xs text-zinc-400 ml-4">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isGatewayUp ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                isGatewayUp ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Gateway:</span>
          {isHealthLoading ? (
            <span className="font-medium text-amber-500 font-mono text-[10px]">Checking</span>
          ) : isGatewayUp ? (
            <span className="font-medium text-emerald-500 font-mono text-[10px]">8080</span>
          ) : (
            <span className="font-medium text-rose-500 font-mono text-[10px]">Offline</span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Open Incidents Pill Alert */}
        {openIncidentsCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>{openIncidentsCount} Open Incidents</span>
          </div>
        )}

        {/* Auto Refresh Toggle */}
        <button
          onClick={toggleAutoRefresh}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
            autoRefresh
              ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
              : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
          }`}
          title="Toggle 5s live polling"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-zinc-400' : ''}`} />
          <span>{autoRefresh ? 'Live' : 'Paused'}</span>
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-md bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
          title="Manual Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>

        <div className="w-px h-4 bg-zinc-800 mx-1"></div>

        {/* Ingest Alert Trigger Button */}
        <button
          onClick={() => setAlertModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs transition-colors focus:ring-2 focus:ring-zinc-400 focus:outline-none"
        >
          <BellPlus className="w-3.5 h-3.5" />
          <span>Simulate Alert</span>
        </button>
      </div>
    </header>
  );
};
