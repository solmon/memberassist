import { apiClient } from './apiClient';

export const plansApi = {
  getEnrollment: () =>
    apiClient.get('/plans/enrollment').then((r) => r.data),

  getEnrollmentHistory: (page = 1, limit = 20) =>
    apiClient.get('/plans/enrollment/history', { params: { page, limit } }).then((r) => r.data),

  getDigitalCard: () =>
    apiClient.get('/plans/enrollment/card').then((r) => r.data),
};
