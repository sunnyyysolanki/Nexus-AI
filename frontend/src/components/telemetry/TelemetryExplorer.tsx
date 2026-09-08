import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useSearchLogs, useQueryMetrics, useIngestLog, useIngestMetric } from '../../hooks/useTelemetry';
import { LogLevel } from '../../types/api';
import { Terminal, LineChart, Search, PlusCircle, Filter } from 'lucide-react';

export const TelemetryExplorer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'metrics'>('logs');

  // Log Search States
  const [logService, setLogService] = useState('order-service');
  const [logLevel, setLogLevel] = useState<string>('ALL');

  // Metric Search States
  const [metricService, setMetricService] = useState('order-service');

  // Time window state (default last 24h)
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [fromTime, setFromTime] = useState(yesterday.toISOString().slice(0, 16));
  const [toTime, setToTime] = useState(now.toISOString().slice(0, 16));

  // Log Ingestion State
  const [newLogMsg, setNewLogMsg] = useState('');
  const [newLogLevel, setNewLogLevel] = useState<LogLevel>('ERROR');

  // Metric Ingestion State
  const [newMetricName, setNewMetricName] = useState('jvm.memory.used');
  const [newMetricVal, setNewMetricVal] = useState('85.4');

  // Queries
  const fromIso = new Date(fromTime).toISOString();
  const toIso = new Date(toTime).toISOString();

  const { data: logs = [], isLoading: isLoadingLogs, refetch: refetchLogs } = useSearchLogs(
    logService,
    fromIso,
    toIso,
    logLevel === 'ALL' ? undefined : (logLevel as LogLevel),
    activeSubTab === 'logs'
  );

  const { data: metrics = [], isLoading: isLoadingMetrics, refetch: refetchMetrics } = useQueryMetrics(
    metricService,
    fromIso,
    toIso,
    activeSubTab === 'metrics'
  );

  // Ingestion Mutations
  const { mutate: addLog, isPending: isAddLogPending } = useIngestLog();
  const { mutate: addMetric, isPending: isAddMetricPending } = useIngestMetric();

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogMsg) return;
    addLog(
      {
        serviceName: logService,
        level: newLogLevel,
        message: newLogMsg,
        timestamp: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setNewLogMsg('');
          refetchLogs();
        },
      }
    );
  };

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetricName || !newMetricVal) return;
    addMetric(
      {
        serviceName: metricService,
        metricName: newMetricName,
        value: parseFloat(newMetricVal),
        timestamp: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          refetchMetrics();
        },
      }
    );
  };

  // ECharts Line Option for Metrics
  const metricChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: metrics.map((m) => new Date(m.timestamp).toLocaleTimeString()),
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
        name: metricService,
        type: 'line',
        smooth: true,
        data: metrics.map((m) => m.value),
        itemStyle: { color: '#06b6d4' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6, 182, 212, 0.4)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.0)' },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Log & Metric Telemetry Explorer</h2>
          <p className="text-xs text-slate-400">Direct query API for Log Service (:8081) and Metric Service (:8082)</p>
        </div>

        {/* Subtab Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-dark-surface border border-dark-border text-xs">
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === 'logs' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs Search</span>
          </button>
          <button
            onClick={() => setActiveSubTab('metrics')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === 'metrics' ? 'bg-cyan-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Metrics Plot</span>
          </button>
        </div>
      </div>

      {/* Global Time Range Selector */}
      <div className="p-3.5 rounded-xl glass-card border border-dark-border flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Service Target:</span>
          </div>
          <input
            type="text"
            value={activeSubTab === 'logs' ? logService : metricService}
            onChange={(e) =>
              activeSubTab === 'logs' ? setLogService(e.target.value) : setMetricService(e.target.value)
            }
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
          />

          {activeSubTab === 'logs' && (
            <select
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="ALL">All Levels</option>
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
              <option value="INFO">INFO</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <span>From:</span>
          <input
            type="datetime-local"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
          />
          <span>To:</span>
          <input
            type="datetime-local"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
          />
          <button
            onClick={() => (activeSubTab === 'logs' ? refetchLogs() : refetchMetrics())}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* LOGS TAB CONTENT */}
      {activeSubTab === 'logs' && (
        <div className="space-y-6">
          {/* Quick Ingest Form */}
          <form onSubmit={handleAddLog} className="p-4 rounded-xl glass-card border border-dark-border flex items-center gap-3 text-xs">
            <span className="font-mono text-slate-400 shrink-0 flex items-center gap-1">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Ingest Log:
            </span>
            <select
              value={newLogLevel}
              onChange={(e) => setNewLogLevel(e.target.value as LogLevel)}
              className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 text-slate-200 font-mono text-xs"
            >
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
              <option value="INFO">INFO</option>
              <option value="DEBUG">DEBUG</option>
            </select>
            <input
              type="text"
              placeholder="Log message content..."
              value={newLogMsg}
              onChange={(e) => setNewLogMsg(e.target.value)}
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={isAddLogPending}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-glow-emerald transition-all shrink-0"
            >
              {isAddLogPending ? 'Saving...' : 'Send Log'}
            </button>
          </form>

          {/* Logs Terminal Stream */}
          <div className="rounded-xl bg-[#080b11] border border-dark-border p-4 font-mono text-xs overflow-x-auto min-h-[350px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-400 text-[11px]">
              <span>Log Output Stream [{logService}]</span>
              <span>{logs.length} Log Entries</span>
            </div>

            {isLoadingLogs ? (
              <div className="text-center py-12 text-slate-500">Querying Log Service...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-slate-600">No logs found for target service and time range.</div>
            ) : (
              <div className="space-y-1.5">
                {logs.map((log, idx) => (
                  <div key={log.id || idx} className="flex items-start gap-3 hover:bg-slate-900/60 p-1 rounded">
                    <span className="text-slate-500 shrink-0 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        log.level === 'ERROR'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                          : log.level === 'WARN'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-indigo-400 shrink-0">[{log.serviceName}]</span>
                    <span className="text-slate-200 break-all">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* METRICS TAB CONTENT */}
      {activeSubTab === 'metrics' && (
        <div className="space-y-6">
          {/* Quick Metric Ingest Form */}
          <form onSubmit={handleAddMetric} className="p-4 rounded-xl glass-card border border-dark-border flex items-center gap-3 text-xs">
            <span className="font-mono text-slate-400 shrink-0 flex items-center gap-1">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Ingest Metric:
            </span>
            <input
              type="text"
              placeholder="Metric Name (e.g. cpu.usage)"
              value={newMetricName}
              onChange={(e) => setNewMetricName(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none"
            />
            <input
              type="number"
              step="any"
              placeholder="Value"
              value={newMetricVal}
              onChange={(e) => setNewMetricVal(e.target.value)}
              className="w-28 bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={isAddMetricPending}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-glow-indigo transition-all shrink-0"
            >
              {isAddMetricPending ? 'Saving...' : 'Send Metric'}
            </button>
          </form>

          {/* ECharts Metric Line Chart */}
          <div className="p-5 rounded-xl glass-card border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-slate-200 font-mono">
                Metric Telemetry Timeline ({metricService})
              </h3>
              <span className="text-xs text-slate-400 font-mono">{metrics.length} Data Points</span>
            </div>
            {isLoadingMetrics ? (
              <div className="py-20 text-center text-slate-500 text-xs font-mono">Querying Metric Service...</div>
            ) : metrics.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-xs">No metrics data points returned.</div>
            ) : (
              <div className="h-80">
                <ReactECharts option={metricChartOption} style={{ height: '100%', width: '100%' }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
