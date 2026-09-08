import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alertApi } from '../api/alertApi';
import { AlertPayload } from '../types/api';
import { INCIDENTS_QUERY_KEY } from './useIncidents';
import { useNotificationStore } from '../store/useNotificationStore';
import { useUIStore } from '../store/useUIStore';

export function useSendAlert() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const setAlertModalOpen = useUIStore((state) => state.setAlertModalOpen);

  return useMutation({
    mutationFn: (payload: AlertPayload) => alertApi.sendAlert(payload),
    onSuccess: (resultMessage, variables) => {
      // Invalidate incidents because ingestion creates incident backend-side
      queryClient.invalidateQueries({ queryKey: INCIDENTS_QUERY_KEY });
      addToast({
        title: '🚨 Alert Ingested',
        message: `${variables.alertName} on [${variables.serviceName}] ingested. Incident created!`,
        type: 'success',
      });
      setAlertModalOpen(false);
    },
    onError: (error: Error) => {
      addToast({
        title: 'Alert Ingestion Failed',
        message: error.message,
        type: 'error',
      });
    },
  });
}
