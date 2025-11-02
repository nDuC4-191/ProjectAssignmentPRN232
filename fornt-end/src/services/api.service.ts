// src/services/api.service.ts
import axios from 'axios';
import type { 
  UserPlantDTO, 
  UserPlantDetailDTO, 
  CreateUserPlantDTO, 
  UpdateUserPlantDTO,
  UserPlantStatisticsDTO,
  PlantCareGuideDTO,
  UserConditionDTO,
  CareSuggestionDTO,
  ProductSuggestionDTO
} from '../types/userPlant.types';

const API_BASE_URL = 'https://localhost:7002/api';

// Axios instance với JWT token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// UserPlant APIs
export const userPlantApi = {
  // Lấy danh sách cây
  getAll: async (): Promise<UserPlantDTO[]> => {
    const response = await api.get('/UserPlant');
    return response.data.data;
  },

  // Lấy chi tiết cây
  getDetail: async (id: number): Promise<UserPlantDetailDTO> => {
    const response = await api.get(`/UserPlant/${id}`);
    return response.data.data;
  },

  // Thêm cây mới
  create: async (data: CreateUserPlantDTO): Promise<UserPlantDTO> => {
    const response = await api.post('/UserPlant', data);
    return response.data.data;
  },

  // Cập nhật cây
  update: async (data: UpdateUserPlantDTO): Promise<void> => {
    await api.put('/UserPlant', data);
  },

  // Xóa cây
  delete: async (id: number): Promise<void> => {
    await api.delete(`/UserPlant/${id}`);
  },

  // Cập nhật tưới nước
  updateWatering: async (id: number, date: Date): Promise<void> => {
    await api.post(`/UserPlant/${id}/water`, { date: date.toISOString() });
  },

  // Cập nhật bón phân
  updateFertilizing: async (id: number, date: Date): Promise<void> => {
    await api.post(`/UserPlant/${id}/fertilize`, { date: date.toISOString() });
  },

  // Cập nhật trạng thái
  updateStatus: async (id: number, status: string): Promise<void> => {
    await api.put(`/UserPlant/${id}/status`, { status });
  },

  // Lọc theo trạng thái
  getByStatus: async (status: string): Promise<UserPlantDTO[]> => {
    const response = await api.get(`/UserPlant/status/${status}`);
    return response.data.data;
  },

  // Tìm kiếm
  search: async (term: string): Promise<UserPlantDTO[]> => {
    const response = await api.get(`/UserPlant/search?term=${term}`);
    return response.data.data;
  },

  // Thống kê
  getStatistics: async (): Promise<UserPlantStatisticsDTO> => {
    const response = await api.get('/UserPlant/statistics');
    return response.data.data;
  },
};

// CareSuggestion APIs
export const careSuggestionApi = {
  // Lấy hướng dẫn chăm sóc 1 cây
  getGuide: async (productId: number): Promise<PlantCareGuideDTO> => {
    const response = await api.get(`/CareSuggestion/guide/${productId}`);
    return response.data.data;
  },

  // Lấy tất cả hướng dẫn
  getAllGuides: async (): Promise<PlantCareGuideDTO[]> => {
    const response = await api.get('/CareSuggestion/guides');
    return response.data.data;
  },

  // Tìm kiếm hướng dẫn
  searchGuides: async (term: string): Promise<PlantCareGuideDTO[]> => {
    const response = await api.get(`/CareSuggestion/guides/search?term=${term}`);
    return response.data.data;
  },

  // Gợi ý cây phù hợp (có lưu lịch sử)
  getRecommendations: async (condition: UserConditionDTO): Promise<CareSuggestionDTO[]> => {
    const response = await api.post('/CareSuggestion/recommend', condition);
    return response.data.data;
  },

  // Gợi ý cây (không lưu lịch sử)
  getRecommendedPlants: async (condition: UserConditionDTO): Promise<ProductSuggestionDTO[]> => {
    const response = await api.post('/CareSuggestion/plants/recommend', condition);
    return response.data.data;
  },

  // Lịch sử gợi ý
  getHistory: async (): Promise<CareSuggestionDTO[]> => {
    const response = await api.get('/CareSuggestion/history');
    return response.data.data;
  },
};

export default api;