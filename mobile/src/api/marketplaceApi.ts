import { apiClient } from './apiClient';

export const marketplaceApi = {
  getOffers: (category?: string, page = 1) =>
    apiClient.get('/marketplace/offers', { params: { category, page } }).then((r) => r.data),

  getOffer: (id: string) =>
    apiClient.get(`/marketplace/offers/${id}`).then((r) => r.data),

  expressInterest: (offerId: string) =>
    apiClient.post(`/marketplace/offers/${offerId}/interest`).then((r) => r.data),
};
