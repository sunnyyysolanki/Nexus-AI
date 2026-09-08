import { apiClient } from './client';
import { Incident, AlertPayload, UpdateIncidentRequest } from '../types/api';

export const incidentApi = {
  // GET /api/v1/incidents
  getIncidents: async (): Promise<Incident[]> => {
    const response = await apiClient.get<Incident[]>('/incidents');
    return response.data;
  },

  // POST /api/v1/incidents
  createIncident: async (payload: AlertPayload): Promise<Incident> => {
    const response = await apiClient.post<Incident>('/incidents', payload);
    return response.data;
  },

  // PUT /api/v1/incidents/{id}
  updateIncident: async (id: string, request: UpdateIncidentRequest): Promise<Incident> => {
    const response = await apiClient.put<Incident>(`/incidents/${id}`, request);
    return response.data;
  },

  // POST /api/v1/incidents/{id}/analyze -> Triggers AI RCA analysis
  analyzeIncident: async (id: string): Promise<string> => {
    const response = await apiClient.post<string>(`/incidents/${id}/analyze`);
    return response.data;
  },
};
