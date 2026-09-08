import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export interface ServiceHealthStatus {
  gateway: boolean;
  alertService: boolean;
  incidentService: boolean;
  rcaService: boolean;
  logService: boolean;
  metricService: boolean;
}

const checkService = async (url: string): Promise<boolean> => {
  try {
    const res = await apiClient.get(url, { timeout: 2500, validateStatus: () => true });
    // Any HTTP response between 200 and 499 (including 405 Method Not Allowed or 404)
    // indicates that the backend process is running and actively responding to HTTP.
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
};

export function useServiceHealth() {
  return useQuery<ServiceHealthStatus>({
    queryKey: ['serviceHealthStatus'],
    queryFn: async () => {
      const now = new Date().toISOString();

      // Probe all microservices through the API Gateway routing paths
      const [gatewayOk, alertOk, incidentOk, rcaOk, logOk, metricOk] = await Promise.all([
        checkService('/incidents'), // Using incident route as a Gateway ping
        checkService('/alerts'), 
        checkService('/incidents'), 
        checkService('/rca/generate'), 
        checkService(`/logs/search?serviceName=ping&from=${now}&to=${now}`), 
        checkService(`/metrics/query?serviceName=ping&from=${now}&to=${now}`), 
      ]);

      return {
        gateway: gatewayOk,
        alertService: alertOk,
        incidentService: incidentOk,
        rcaService: rcaOk,
        logService: logOk,
        metricService: metricOk,
      };
    },
    refetchInterval: 10000, // Probe every 10 seconds
    staleTime: 4000,
  });
}
