import api from './api';
import type { Event } from '@/types';

export const eventService = {
  getEvents: async (): Promise<Event[]> => {
    const response = await api.get('/events');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data.data || response.data;
  },

  createEvent: async (eventData: Partial<Event>): Promise<Event> => {
    const response = await api.post('/events', eventData);
    return response.data.data || response.data;
  },

  updateEvent: async (id: string, eventData: Partial<Event>): Promise<Event> => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data.data || response.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

export default eventService;
