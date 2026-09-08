import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentApi } from '../api/incidentApi';
import { UpdateIncidentRequest, Incident } from '../types/api';
import { useUIStore } from '../store/useUIStore';
import { useNotificationStore } from '../store/useNotificationStore';

export const INCIDENTS_QUERY_KEY = ['incidents'];

export function useIncidents() {
  const autoRefresh = useUIStore((state) => state.autoRefresh);

  return useQuery({
    queryKey: INCIDENTS_QUERY_KEY,
    queryFn: incidentApi.getIncidents,
    refetchInterval: autoRefresh ? 5000 : false, // Poll every 5s if active
    staleTime: 2000,
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const closeEditModal = useUIStore((state) => state.closeEditModal);
  const setSelectedIncident = useUIStore((state) => state.setSelectedIncident);

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateIncidentRequest }) =>
      incidentApi.updateIncident(id, request),
    onSuccess: async (updatedIncident) => {
      // 1. Invalidate incidents query cache so list and table reload
      await queryClient.invalidateQueries({ queryKey: INCIDENTS_QUERY_KEY });

      // 2. Immediately update the selectedIncident in Zustand store so open Drawer updates in real-time!
      setSelectedIncident(updatedIncident);

      addToast({
        title: 'Incident Updated',
        message: `Status updated to ${updatedIncident.status} for incident: ${updatedIncident.id.slice(0, 8)}`,
        type: 'success',
      });
      closeEditModal();
    },
    onError: (error: Error) => {
      addToast({
        title: 'Update Failed',
        message: error.message,
        type: 'error',
      });
    },
  });
}

export function useAnalyzeIncident() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const setSelectedIncident = useUIStore((state) => state.setSelectedIncident);

  return useMutation({
    mutationFn: (id: string) => incidentApi.analyzeIncident(id),
    onSuccess: async (summaryResult, incidentId) => {
      // Invalidate list so fresh data with RCA summary and score is loaded
      await queryClient.invalidateQueries({ queryKey: INCIDENTS_QUERY_KEY });

      // Update selected incident in store if drawer is open
      const incidents = queryClient.getQueryData<Incident[]>(INCIDENTS_QUERY_KEY);
      if (incidents) {
        const fresh = incidents.find((i) => i.id === incidentId);
        if (fresh) setSelectedIncident(fresh);
      }

      addToast({
        title: '🤖 AI Root Cause Analysis Completed',
        message: summaryResult,
        type: 'success',
        duration: 6000,
      });
    },
    onError: (error: Error) => {
      addToast({
        title: 'AI Analysis Failed',
        message: error.message,
        type: 'error',
      });
    },
  });
}
