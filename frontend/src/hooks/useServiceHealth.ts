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

/**
 * Hits /actuator/health on each microservice directly.
 * Returns true only if the service responds with { "status": "UP" }.
 * /actuator/health is publicly accessible — no X-Internal-Token required.
 */
const checkHealth = async (baseUrl: string): Promise<boolean> => {
  if (!baseUrl) return false;
  try {
    const res = await axios.get(`${baseUrl}/actuator/health`, {
      timeout: 15000,
      validateStatus: () => true,
    });
    return res.status === 200 && res.data?.status === 'UP';
  } catch {
    return false;
  }
};

export function useServiceHealth() {
  return useQuery<ServiceHealthStatus>({
    queryKey: ['serviceHealthStatus'],
    queryFn: async () => {
      const [gatewayOk, alertOk, incidentOk, rcaOk, logOk, metricOk] = await Promise.all([
        checkHealth(import.meta.env.VITE_GATEWAY_URL || ''),
        checkHealth(import.meta.env.VITE_ALERT_SERVICE_URL || ''),
        checkHealth(import.meta.env.VITE_INCIDENT_SERVICE_URL || ''),
        checkHealth(import.meta.env.VITE_RCA_SERVICE_URL || ''),
        checkHealth(import.meta.env.VITE_LOG_SERVICE_URL || ''),
        checkHealth(import.meta.env.VITE_METRIC_SERVICE_URL || ''),
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
    refetchInterval: 60000, // Re-check every 60 seconds
    staleTime: 30000,
  });
}
