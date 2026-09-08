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
  if (!url) return false;
  try {
    const res = await axios.get(url, { timeout: 30000, validateStatus: () => true });
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

      // Probe each microservice independently using their public URLs
      const [gatewayOk, alertOk, incidentOk, rcaOk, logOk, metricOk] = await Promise.all([
        checkService(`${import.meta.env.VITE_GATEWAY_URL || ''}/api/v1/incidents`), 
        checkService(`${import.meta.env.VITE_ALERT_SERVICE_URL || ''}/api/v1/alerts`), 
        checkService(`${import.meta.env.VITE_INCIDENT_SERVICE_URL || ''}/api/v1/incidents`), 
        checkService(`${import.meta.env.VITE_RCA_SERVICE_URL || ''}/api/v1/rca/generate`), 
        checkService(`${import.meta.env.VITE_LOG_SERVICE_URL || ''}/api/v1/logs/search?serviceName=ping&from=${now}&to=${now}`), 
        checkService(`${import.meta.env.VITE_METRIC_SERVICE_URL || ''}/api/v1/metrics/query?serviceName=ping&from=${now}&to=${now}`), 
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
