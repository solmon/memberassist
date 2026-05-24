import { apiClient } from './apiClient';

export const communicationsApi = {
  getMessages: (channel?: string, page = 1) =>
    apiClient.get('/communications/messages', { params: { channel, page } }).then((r) => r.data),

  getMessage: (id: string) =>
    apiClient.get(`/communications/messages/${id}`).then((r) => r.data),

  markMessageRead: (id: string) =>
    apiClient.patch(`/communications/messages/${id}/read`).then((r) => r.data),

  getUnreadCounts: () =>
    apiClient.get('/communications/unread-counts').then((r) => r.data),
};
