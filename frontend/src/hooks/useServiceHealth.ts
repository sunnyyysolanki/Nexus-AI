import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
    const res = await axios.get(url, { timeout: 2500, validateStatus: () => true });
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

      // Probe Gateway (:8080) and Direct Ports (:8081 - :8085) independently
      const [gatewayOk, alertOk, incidentOk, rcaOk, logOk, metricOk] = await Promise.all([
        checkService('/api/v1/incidents'), // API Gateway Port 8080
        checkService('/direct/alert/api/v1/alerts'), // Alert Service Direct Port 8083
        checkService('/direct/incident/api/v1/incidents'), // Incident Service Direct Port 8084
        checkService('/direct/rca/api/v1/rca/generate'), // RCA Service Direct Port 8085
        checkService(`/direct/log/api/v1/logs/search?serviceName=ping&from=${now}&to=${now}`), // Log Service Direct Port 8081
        checkService(`/direct/metric/api/v1/metrics/query?serviceName=ping&from=${now}&to=${now}`), // Metric Service Direct Port 8082
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
