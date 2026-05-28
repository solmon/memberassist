import { apiClient } from './apiClient';
import { Dependant } from '../types/dependant';

export const dependentsApi = {
  getDependents: () =>
    apiClient.get('/dependents').then((r) => r.data),

  createDependent: (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    relationship: string;
    enrollmentId: string;
  }) => apiClient.post('/dependents', data).then((r) => r.data),

  getDependent: (id: string) =>
    apiClient.get(`/dependents/${id}`).then((r) => r.data),

  deleteDependent: (id: string) =>
    apiClient.delete(`/dependents/${id}`).then(() => undefined),

  getDependants: () =>
    apiClient.get('/members/me/dependants').then((r) => r.data as Dependant[]),
};
