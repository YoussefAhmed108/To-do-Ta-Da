import api from './api';
import type { AuthResponse, User } from '@/types';

export const authService = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data.data; // Extract nested data object
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data; // Extract nested data object
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.data; // Extract nested data object
  },
};

export default authService;
