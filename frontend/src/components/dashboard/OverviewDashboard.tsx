import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useIncidents } from '../../hooks/useIncidents';
import { StatusBadge } from '../common/StatusBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import { useUIStore } from '../../store/useUIStore';
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const { data: incidents = [], isLoading, error } = useIncidents();
  const { setSelectedIncident, setRcaDrawerOpen, setActiveTab } = useUIStore();

  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter((i) => i.status === 'OPEN').length;
  const investigatingIncidents = incidents.filter((i) => i.status === 'INVESTIGATING').length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'RESOLVED').length;
  const criticalIncidents = incidents.filter((i) => i.severity?.toUpperCase() === 'CRITICAL').length;
  const analyzedCount = incidents.filter((i) => i.confidenceScore !== null && i.confidenceScore !== undefined).length;

  // Severity Distribution Data for Pie Chart
  const severityCounts = incidents.reduce((acc, curr) => {
    const sev = (curr.severity || 'INFO').toUpperCase();
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#18181b', // zinc-900
      borderColor: '#27272a', // zinc-800
      textStyle: { color: '#f4f4f5' },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#a1a1aa', fontSize: 12 },
    },
    series: [
      {
        name: 'Severity',
        type: 'pie',
        radius: ['55%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#09090b', // match bg
          borderWidth: 2,
        },
        label: { show: false },
        data: [
          { value: severityCounts['CRITICAL'] || 0, name: 'CRITICAL', itemStyle: { color: '#ef4444' } },
          { value: severityCounts['HIGH'] || 0, name: 'HIGH', itemStyle: { color: '#f97316' } },
          { value: severityCounts['MEDIUM'] || 0, name: 'MEDIUM', itemStyle: { color: '#eab308' } },
          { value: severityCounts['LOW'] || 0, name: 'LOW', itemStyle: { color: '#3b82f6' } },
        ],
      },
    ],
  };

  // Status Distribution Option for Bar Chart
  const statusBarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      textStyle: { color: '#f4f4f5' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['OPEN', 'INVESTIGATING', 'RESOLVED'],
      axisLine: { lineStyle: { color: '#27272a' } },
      axisLabel: { color: '#a1a1aa', fontSize: 11, fontWeight: 500 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#27272a' } },
      splitLine: { lineStyle: { color: '#18181b' } },
      axisLabel: { color: '#a1a1aa', fontSize: 11 },
    },
    series: [
      {
        data: [
          { value: openIncidents, itemStyle: { color: '#ef4444' } },
          { value: investigatingIncidents, itemStyle: { color: '#f59e0b' } },
          { value: resolvedIncidents, itemStyle: { color: '#10b981' } },
        ],
        type: 'bar',
        barWidth: '32%',
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-dark-border">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Overview</h2>
          <p className="text-xs text-zinc-500 mt-1">Real-time incident metrics and RCA status</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-md border border-dark-border shadow-sm">
          <Cpu className="w-4 h-4 text-zinc-300" />
          <span>Engine: Active</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Incidents */}
        <div className="p-4 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-zinc-500">Total Incidents</p>
            <h3 className="text-2xl font-semibold text-zinc-100 mt-1">{totalIncidents}</h3>
            <p className="text-[11px] text-zinc-400 mt-1">{analyzedCount} Analyzed by AI</p>
          </div>
          <div className="p-2.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Open Incidents */}
        <div className="p-4 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-zinc-500">Open Incidents</p>
            <h3 className="text-2xl font-semibold text-rose-500 mt-1">{openIncidents}</h3>
            <p className="text-[11px] text-rose-500/80 mt-1 font-medium">Requires Action</p>
          </div>
          <div className="p-2.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Investigating */}
        <div className="p-4 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-zinc-500">Investigating</p>
            <h3 className="text-2xl font-semibold text-amber-500 mt-1">{investigatingIncidents}</h3>
            <p className="text-[11px] text-amber-500/80 mt-1">In Diagnostics</p>
          </div>
          <div className="p-2.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Resolved */}
        <div className="p-4 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-zinc-500">Resolved</p>
            <h3 className="text-2xl font-semibold text-emerald-500 mt-1">{resolvedIncidents}</h3>
            <p className="text-[11px] text-emerald-500/80 mt-1">Closed & Verified</p>
          </div>
          <div className="p-2.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ECharts Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Severity Pie Chart Card */}
        <div className="p-5 rounded-lg bg-dark-surface border border-dark-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-zinc-100">Severity Breakdown</h3>
            <span className="text-[11px] font-medium text-zinc-500">{criticalIncidents} Critical</span>
          </div>
          <div className="h-64">
            <ReactECharts option={pieChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Status Bar Chart Card */}
        <div className="p-5 rounded-lg bg-dark-surface border border-dark-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-zinc-100">Status Lifecycle</h3>
            <span className="text-[11px] font-medium text-zinc-500">Live Counters</span>
          </div>
          <div className="h-64">
            <ReactECharts option={statusBarOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Recent Incidents Quick Preview */}
      <div className="p-0 rounded-lg bg-dark-surface border border-dark-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-dark-border flex items-center justify-between bg-zinc-900/50">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">Recent Incidents</h3>
          </div>
          <button
            onClick={() => setActiveTab('incidents')}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            View All &rarr;
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-zinc-500 text-xs">Loading telemetry data...</div>
        ) : error ? (
          <div className="py-8 text-center text-rose-500 text-xs">Failed to load incidents.</div>
        ) : incidents.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">No incidents found in system database.</div>
        ) : (
          <div className="divide-y divide-dark-border">
            {incidents.slice(0, 4).map((incident) => (
              <div
                key={incident.id}
                onClick={() => {
                  setSelectedIncident(incident);
                  setRcaDrawerOpen(true);
                }}
                className="py-3 px-5 hover:bg-zinc-800/50 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <StatusBadge status={incident.status} size="sm" />
                  <div>
                    <h4 className="text-sm font-medium text-zinc-200 line-clamp-1">{incident.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-1">
                      <span>{incident.serviceName}</span>
                      <span>•</span>
                      <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {incident.confidenceScore !== undefined && incident.confidenceScore !== null && (
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{incident.confidenceScore}% RCA Match</span>
                    </div>
                  )}
                  <SeverityBadge severity={incident.severity} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
