// src/services/adminApi.service.ts
import api from './api.service';

export const adminApi = {
  // --- PRODUCTS ---
  getProducts: async () => {
    const res = await api.get('/admin/products');
    return res.data;
  },
  getProductById: async (id: number) => {
    const res = await api.get(`/admin/products/${id}`);
    return res.data;
  },
  createProduct: async (data: any) => {
    const res = await api.post('/admin/products', data);
    return res.data;
  },
  updateProduct: async (id: number, data: any) => {
    const res = await api.put(`/admin/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id: number) => {
    await api.delete(`/admin/products/${id}`);
  },

  // --- CATEGORIES ---
  getCategories: async () => {
    const res = await api.get('/admin/categories');
    return res.data;
  },
  createCategory: async (data: any) => {
    const res = await api.post('/admin/categories', data);
    return res.data;
  },
  updateCategory: async (id: number, data: any) => {
    await api.put(`/admin/categories/${id}`, data);
  },
  deleteCategory: async (id: number) => {
    await api.delete(`/admin/categories/${id}`);
  },

  // --- USERS ---
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  updateUserRole: async (id: number, role: string) => {
    await api.put(`/admin/users/${id}/role`, { role });
  },
  setUserActive: async (id: number, isActive: boolean) => {
    await api.put(`/admin/users/${id}/active?isActive=${isActive}`);
  },
};
