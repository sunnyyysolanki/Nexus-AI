import { apiClient } from './client';
import { RcaRequest, RcaResponse } from '../types/api';

export const rcaApi = {
  // POST /api/v1/rca/generate
  generateRca: async (request: RcaRequest): Promise<RcaResponse> => {
    const response = await apiClient.post<RcaResponse>('/rca/generate', request);
    return response.data;
  },
};
