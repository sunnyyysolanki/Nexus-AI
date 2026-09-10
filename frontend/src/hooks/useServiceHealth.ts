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

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || '';

/**
 * Checks service health by routing through the API Gateway.
 * Gateway proxies /api/health/<service> -> <service>/actuator/health
 * This avoids CORS issues since all calls go through the one gateway domain.
 * Returns true only if the service responds with { "status": "UP" }.
 */
const checkHealth = async (path: string): Promise<boolean> => {
  if (!GATEWAY) return false;
  try {
    const res = await axios.get(`${GATEWAY}${path}`, {
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
        checkHealth('/actuator/health'),          // gateway's own health
        checkHealth('/api/health/alert'),
        checkHealth('/api/health/incident'),
        checkHealth('/api/health/rca'),
        checkHealth('/api/health/log'),
        checkHealth('/api/health/metric'),
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
