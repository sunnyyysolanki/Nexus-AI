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
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc' },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#94a3b8', fontSize: 12 },
    },
    series: [
      {
        name: 'Severity',
        type: 'pie',
        radius: ['50%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#131926',
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
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['OPEN', 'INVESTIGATING', 'RESOLVED'],
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    series: [
      {
        data: [
          { value: openIncidents, itemStyle: { color: '#f43f5e' } },
          { value: investigatingIncidents, itemStyle: { color: '#f59e0b' } },
          { value: resolvedIncidents, itemStyle: { color: '#10b981' } },
        ],
        type: 'bar',
        barWidth: '40%',
        itemStyle: { borderRadius: [6, 6, 0, 0] },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Platform Telemetry Dashboard</h2>
          <p className="text-xs text-slate-400">Real-time incident metrics, severity breakdown, and AI RCA status</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-dark-surface px-3 py-1.5 rounded-lg border border-dark-border">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>RCA AI Engine: Ready</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Incidents */}
        <div className="p-4 rounded-xl glass-card glass-card-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Incidents</p>
            <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">{totalIncidents}</h3>
            <p className="text-[11px] text-slate-500 mt-1">{analyzedCount} Analyzed by AI</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Open Incidents */}
        <div className="p-4 rounded-xl glass-card glass-card-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Open Incidents</p>
            <h3 className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">{openIncidents}</h3>
            <p className="text-[11px] text-rose-500/80 mt-1 font-medium">Requires Immediate Attention</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-glow-rose">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Investigating */}
        <div className="p-4 rounded-xl glass-card glass-card-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Investigating</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{investigatingIncidents}</h3>
            <p className="text-[11px] text-amber-500/80 mt-1">In Active Diagnostics</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Resolved */}
        <div className="p-4 rounded-xl glass-card glass-card-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Resolved</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{resolvedIncidents}</h3>
            <p className="text-[11px] text-emerald-500/80 mt-1">Closed & Verified</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ECharts Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Pie Chart Card */}
        <div className="p-5 rounded-xl glass-card border border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-slate-200">Incident Severity Breakdown</h3>
            <span className="text-[11px] font-mono text-slate-400">{criticalIncidents} Critical</span>
          </div>
          <div className="h-64">
            <ReactECharts option={pieChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Status Bar Chart Card */}
        <div className="p-5 rounded-xl glass-card border border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-slate-200">Incident Status Lifecycle</h3>
            <span className="text-[11px] font-mono text-slate-400">Live Counters</span>
          </div>
          <div className="h-64">
            <ReactECharts option={statusBarOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Recent Incidents Quick Preview */}
      <div className="p-5 rounded-xl glass-card border border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm text-slate-200">Recent System Incidents</h3>
            <p className="text-xs text-slate-400">Click any incident to open full AI Root Cause Analysis</p>
          </div>
          <button
            onClick={() => setActiveTab('incidents')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View All ({totalIncidents}) &rarr;
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading telemetry data...</div>
        ) : error ? (
          <div className="py-8 text-center text-rose-400 text-xs">Failed to load incidents. Is gateway active on port 8080?</div>
        ) : incidents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No incidents found in system database. Use "Simulate Alert" to ingest one.</div>
        ) : (
          <div className="divide-y divide-dark-border/60">
            {incidents.slice(0, 4).map((incident) => (
              <div
                key={incident.id}
                onClick={() => {
                  setSelectedIncident(incident);
                  setRcaDrawerOpen(true);
                }}
                className="py-3 px-3 rounded-lg hover:bg-dark-hover flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={incident.status} size="sm" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{incident.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>{incident.serviceName}</span>
                      <span>•</span>
                      <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {incident.confidenceScore !== undefined && incident.confidenceScore !== null && (
                    <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>{incident.confidenceScore}% RCA Confidence</span>
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
