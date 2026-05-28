import { apiClient } from './apiClient';
import { PlanSummary } from '../types/planSummary';

export const plansApi = {
  getEnrollment: () =>
    apiClient.get('/plans/enrollment').then((r) => r.data),

  getEnrollmentHistory: (page = 1, limit = 20) =>
    apiClient.get('/plans/enrollment/history', { params: { page, limit } }).then((r) => r.data),

  getDigitalCard: () =>
    apiClient.get('/plans/enrollment/card').then((r) => r.data),

  getPlanSummary: () =>
    apiClient.get('/members/me/plan-summary').then((r) => r.data as PlanSummary[]),
};
