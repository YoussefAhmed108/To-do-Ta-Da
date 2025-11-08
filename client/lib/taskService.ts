import api from './api';
import type { Task } from '@/types';

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data || response.data;
  },

  createTask: async (taskData: Partial<Task>): Promise<Task> => {
    const response = await api.post('/tasks', taskData);
    return response.data.data || response.data;
  },

  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data.data || response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  markTaskComplete: async (id: string): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/complete`);
    return response.data.data || response.data;
  },

  moveTask: async (id: string, columnId: string, position: number): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/move`, { columnId, position });
    return response.data.data || response.data;
  },

  startTimer: async (id: string): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/timer/start`);
    return response.data.data || response.data;
  },

  stopTimer: async (id: string): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/timer/stop`);
    return response.data.data || response.data;
  },

  getSubtasks: async (id: string): Promise<Task[]> => {
    const response = await api.get(`/tasks/${id}/subtasks`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};

export default taskService;
