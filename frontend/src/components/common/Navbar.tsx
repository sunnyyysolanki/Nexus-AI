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
    <header className="sticky top-0 z-40 bg-dark-surface/90 backdrop-blur-md border-b border-dark-border px-6 py-3.5 flex items-center justify-between">
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-glow-indigo flex items-center justify-center">
            <div className="h-full w-full bg-dark-bg rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight font-sans">
                NEXUS<span className="text-indigo-400 font-normal ml-1">AI</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Autonomous Observability & RCA Engine</p>
          </div>
        </div>

        {/* Dynamic Gateway Connection Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isGatewayUp ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isGatewayUp ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="font-mono text-slate-400">Gateway Port:</span>
          {isHealthLoading ? (
            <span className="font-semibold text-amber-400 animate-pulse font-mono">8080 Checking...</span>
          ) : isGatewayUp ? (
            <span className="font-semibold text-emerald-400 font-mono">8080 Active</span>
          ) : (
            <span className="font-semibold text-rose-400 font-mono">8080 Offline</span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Open Incidents Pill Alert */}
        {openIncidentsCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse">
            <Activity className="w-3.5 h-3.5" />
            <span>{openIncidentsCount} Open Incidents</span>
          </div>
        )}

        {/* Auto Refresh Toggle */}
        <button
          onClick={toggleAutoRefresh}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            autoRefresh
              ? 'bg-indigo-950/50 border-indigo-700/60 text-indigo-300'
              : 'bg-dark-bg border-dark-border text-slate-400'
          }`}
          title="Toggle 5s live polling"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{autoRefresh ? 'Live Polling ON' : 'Polling Paused'}</span>
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={() => refetch()}
          className="p-2 rounded-lg bg-dark-bg border border-dark-border text-slate-300 hover:text-white hover:border-slate-600 transition-all"
          title="Manual Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>

        {/* Ingest Alert Trigger Button */}
        <button
          onClick={() => setAlertModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs shadow-glow-rose transition-all transform active:scale-95"
        >
          <BellPlus className="w-4 h-4" />
          <span>Simulate Alert</span>
        </button>
      </div>
    </header>
  );
};
