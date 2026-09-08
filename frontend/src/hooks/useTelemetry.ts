import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { telemetryApi } from '../api/telemetryApi';
import { LogEntity, LogLevel, MetricEntity } from '../types/api';
import { useNotificationStore } from '../store/useNotificationStore';

export function useSearchLogs(
  serviceName: string,
  from: string,
  to: string,
  level?: LogLevel,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['logs', serviceName, from, to, level],
    queryFn: () => telemetryApi.searchLogs(serviceName, from, to, level),
    enabled: enabled && !!serviceName && !!from && !!to,
    staleTime: 5000,
  });
}

export function useQueryMetrics(
  serviceName: string,
  from: string,
  to: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['metrics', serviceName, from, to],
    queryFn: () => telemetryApi.queryMetrics(serviceName, from, to),
    enabled: enabled && !!serviceName && !!from && !!to,
    staleTime: 5000,
  });
}

export function useIngestLog() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);

  return useMutation({
    mutationFn: (logEntry: LogEntity) => telemetryApi.addLog(logEntry),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      addToast({
        title: 'Log Entry Ingested',
        message: `Log created for ${variables.serviceName} [${variables.level}]`,
        type: 'success',
      });
    },
    onError: (error: Error) => {
      addToast({ title: 'Log Ingestion Failed', message: error.message, type: 'error' });
    },
  });
}

export function useIngestMetric() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);

  return useMutation({
    mutationFn: (metricPoint: Omit<MetricEntity, 'id'>) => telemetryApi.addMetric(metricPoint),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      addToast({
        title: 'Metric Ingested',
        message: `${variables.metricName} = ${variables.value} on ${variables.serviceName}`,
        type: 'success',
      });
    },
    onError: (error: Error) => {
      addToast({ title: 'Metric Ingestion Failed', message: error.message, type: 'error' });
    },
  });
}
