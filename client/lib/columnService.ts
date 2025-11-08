import api from './api';
import type { Column } from '@/types';

export const columnService = {
  getColumns: async (): Promise<Column[]> => {
    const response = await api.get('/columns');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  createColumn: async (name: string, color: string): Promise<Column> => {
    const response = await api.post('/columns', { name, color });
    return response.data.data || response.data;
  },

  updateColumn: async (id: string, name: string, color: string): Promise<Column> => {
    const response = await api.put(`/columns/${id}`, { name, color });
    return response.data.data || response.data;
  },

  deleteColumn: async (id: string): Promise<void> => {
    await api.delete(`/columns/${id}`);
  },

  reorderColumns: async (columnIds: string[]): Promise<Column[]> => {
    const response = await api.post('/columns/reorder', { columnIds });
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};

export default columnService;
