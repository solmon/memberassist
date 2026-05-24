import { apiClient } from './apiClient';

export const eventsApi = {
  getEvents: (myRsvpOnly?: boolean) =>
    apiClient.get('/events', { params: { myRsvpOnly } }).then((r) => r.data),

  getEvent: (id: string) =>
    apiClient.get(`/events/${id}`).then((r) => r.data),

  createRsvp: (eventId: string) =>
    apiClient.post(`/events/${eventId}/rsvp`).then((r) => r.data),

  cancelRsvp: (eventId: string) =>
    apiClient.delete(`/events/${eventId}/rsvp`).then(() => undefined),
};
