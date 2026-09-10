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
      backgroundColor: '#18181b', // zinc-900
      borderColor: '#27272a', // zinc-800
      textStyle: { color: '#f4f4f5' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: metrics.map((m) => new Date(m.timestamp).toLocaleTimeString()),
      axisLine: { lineStyle: { color: '#27272a' } },
      axisLabel: { color: '#a1a1aa', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#27272a' } },
      splitLine: { lineStyle: { color: '#18181b' } },
      axisLabel: { color: '#a1a1aa', fontSize: 11 },
    },
    series: [
      {
        name: metricService,
        type: 'line',
        smooth: true,
        data: metrics.map((m) => m.value),
        itemStyle: { color: '#38bdf8' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(56, 189, 248, 0.2)' },
              { offset: 1, color: 'rgba(56, 189, 248, 0.0)' },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-dark-border">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Telemetry Explorer</h2>
          <p className="text-xs text-zinc-500 mt-1">Direct query API for Log Service and Metric Service</p>
        </div>

        {/* Subtab Toggle */}
        <div className="flex items-center p-0.5 rounded-md bg-zinc-900 border border-dark-border text-xs">
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm font-medium transition-colors ${
              activeSubTab === 'logs' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs Search</span>
          </button>
          <button
            onClick={() => setActiveSubTab('metrics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm font-medium transition-colors ${
              activeSubTab === 'metrics' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Metrics Plot</span>
          </button>
        </div>
      </div>

      {/* Global Time Range Selector & Filters */}
      <div className="p-3 rounded-md bg-dark-surface border border-dark-border flex flex-col lg:flex-row items-center justify-between gap-4 text-xs shadow-sm">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-zinc-500 font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Service:</span>
          </div>
          <input
            type="text"
            value={activeSubTab === 'logs' ? logService : metricService}
            onChange={(e) =>
              activeSubTab === 'logs' ? setLogService(e.target.value) : setMetricService(e.target.value)
            }
            className="bg-dark-bg border border-dark-border rounded-md px-3 py-1.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 w-full lg:w-auto"
          />

          {activeSubTab === 'logs' && (
            <select
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-md px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            >
              <option value="ALL">All Levels</option>
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
              <option value="INFO">INFO</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 text-zinc-400 font-medium w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2">
            <span>From:</span>
            <input
              type="datetime-local"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-md px-2 py-1.5 text-zinc-200 text-[11px] focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>To:</span>
            <input
              type="datetime-local"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-md px-2 py-1.5 text-zinc-200 text-[11px] focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />
          </div>
          <button
            onClick={() => (activeSubTab === 'logs' ? refetchLogs() : refetchMetrics())}
            className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs transition-colors shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      {/* LOGS TAB CONTENT */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          {/* Quick Ingest Form */}
          <form onSubmit={handleAddLog} className="p-3 rounded-md bg-dark-surface border border-dark-border flex flex-wrap items-center gap-3 text-xs shadow-sm">
            <span className="font-medium text-zinc-400 shrink-0 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-zinc-500" />
              Ingest Log:
            </span>
            <select
              value={newLogLevel}
              onChange={(e) => setNewLogLevel(e.target.value as LogLevel)}
              className="bg-dark-bg border border-dark-border rounded-md px-2 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
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
              className="flex-1 bg-dark-bg border border-dark-border rounded-md px-3 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500 min-w-[200px]"
            />
            <button
              type="submit"
              disabled={isAddLogPending}
              className="px-4 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium border border-zinc-700 transition-colors shrink-0"
            >
              {isAddLogPending ? 'Saving...' : 'Send Log'}
            </button>
          </form>

          {/* Logs Terminal Stream */}
          <div className="rounded-md bg-[#09090b] border border-zinc-800 p-4 font-mono text-xs overflow-x-auto min-h-[400px] shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3 text-zinc-500 text-[10px] uppercase tracking-widest">
              <span>Output Stream [{logService}]</span>
              <span>{logs.length} Entries</span>
            </div>

            {isLoadingLogs ? (
              <div className="text-center py-12 text-zinc-600">Querying Log Service...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">No logs found for target service and time range.</div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, idx) => (
                  <div key={log.id || idx} className="flex items-start gap-3 hover:bg-zinc-900/80 px-2 py-1.5 rounded-sm">
                    <span className="text-zinc-600 shrink-0 text-[10px] mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase shrink-0 ${
                        log.level === 'ERROR'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-zinc-400 shrink-0 font-medium">[{log.serviceName}]</span>
                    <span className="text-zinc-300 break-all">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* METRICS TAB CONTENT */}
      {activeSubTab === 'metrics' && (
        <div className="space-y-4">
          {/* Quick Metric Ingest Form */}
          <form onSubmit={handleAddMetric} className="p-3 rounded-md bg-dark-surface border border-dark-border flex flex-wrap items-center gap-3 text-xs shadow-sm">
            <span className="font-medium text-zinc-400 shrink-0 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-zinc-500" />
              Ingest Metric:
            </span>
            <input
              type="text"
              placeholder="Metric Name (e.g. cpu.usage)"
              value={newMetricName}
              onChange={(e) => setNewMetricName(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-md px-3 py-1.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-500"
            />
            <input
              type="number"
              step="any"
              placeholder="Value"
              value={newMetricVal}
              onChange={(e) => setNewMetricVal(e.target.value)}
              className="w-28 bg-dark-bg border border-dark-border rounded-md px-3 py-1.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-500"
            />
            <button
              type="submit"
              disabled={isAddMetricPending}
              className="px-4 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium border border-zinc-700 transition-colors shrink-0"
            >
              {isAddMetricPending ? 'Saving...' : 'Send Metric'}
            </button>
          </form>

          {/* ECharts Metric Line Chart */}
          <div className="p-5 rounded-md bg-dark-surface border border-dark-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-zinc-100">
                Metric Timeline ({metricService})
              </h3>
              <span className="text-[11px] text-zinc-500 font-medium">{metrics.length} Data Points</span>
            </div>
            {isLoadingMetrics ? (
              <div className="py-20 text-center text-zinc-600 text-xs">Querying Metric Service...</div>
            ) : metrics.length === 0 ? (
              <div className="py-20 text-center text-zinc-600 text-xs">No metrics data points returned.</div>
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
