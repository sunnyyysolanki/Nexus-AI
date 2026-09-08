import { apiClient } from './client';
import { AlertPayload } from '../types/api';

export const alertApi = {
  // POST /api/v1/alerts
  sendAlert: async (payload: AlertPayload): Promise<string> => {
    const response = await apiClient.post<string>('/alerts', payload);
    return response.data;
  },
};
