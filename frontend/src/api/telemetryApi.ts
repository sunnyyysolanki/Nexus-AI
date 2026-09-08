import { apiClient } from './client';
import { LogEntity, LogLevel, MetricEntity } from '../types/api';

export const telemetryApi = {
  // POST /api/v1/logs
  addLog: async (logEntry: LogEntity): Promise<LogEntity> => {
    const response = await apiClient.post<LogEntity>('/logs', logEntry);
    return response.data;
  },

  // GET /api/v1/logs/search
  searchLogs: async (
    serviceName: string,
    from: string,
    to: string,
    level?: LogLevel
  ): Promise<LogEntity[]> => {
    const params: Record<string, string> = { serviceName, from, to };
    if (level) params.level = level;
    const response = await apiClient.get<LogEntity[]>('/logs/search', { params });
    return response.data;
  },

  // POST /api/v1/metrics
  addMetric: async (metricPoint: Omit<MetricEntity, 'id'>): Promise<MetricEntity> => {
    const response = await apiClient.post<MetricEntity>('/metrics', metricPoint);
    return response.data;
  },

  // GET /api/v1/metrics/query
  queryMetrics: async (
    serviceName: string,
    from: string,
    to: string
  ): Promise<MetricEntity[]> => {
    const response = await apiClient.get<MetricEntity[]>('/metrics/query', {
      params: { serviceName, from, to },
    });
    return response.data;
  },
};
