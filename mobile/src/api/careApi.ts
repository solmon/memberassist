import { apiClient } from './apiClient';

export const careApi = {
  searchProviders: (params: { lat?: number; lng?: number; radiusMiles?: number; specialty?: string; acceptingNewPatients?: boolean }) =>
    apiClient.get('/care/providers', { params }).then((r) => r.data),

  getProvider: (id: string) =>
    apiClient.get(`/care/providers/${id}`).then((r) => r.data),

  submitPcpChange: (providerId: string) =>
    apiClient.post('/care/pcp-selection', { providerId }).then((r) => r.data),
};
