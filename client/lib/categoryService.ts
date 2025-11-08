import api from './api';

export const categoryService = {
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/auth/categories');
    return response.data.data.categories;
  },

  addCategory: async (category: string): Promise<string[]> => {
    const response = await api.post('/auth/categories', { category });
    return response.data.data.categories;
  },

  deleteCategory: async (category: string): Promise<string[]> => {
    const response = await api.delete(`/auth/categories/${encodeURIComponent(category)}`);
    return response.data.data.categories;
  },
};

export default categoryService;
