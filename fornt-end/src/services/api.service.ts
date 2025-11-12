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

const API_BASE_URL = 'http://localhost:5239/api'; 
// Tạo instance không có headers cứng
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor để thêm JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// UserPlant APIs
export const userPlantApi = {
  getAll: async (): Promise<UserPlantDTO[]> => {
    const res = await api.get('/UserPlant');
    return res.data.data;
  },
  getDetail: async (id: number): Promise<UserPlantDetailDTO> => {
    const res = await api.get(`/UserPlant/${id}`);
    return res.data.data;
  },
  create: async (data: CreateUserPlantDTO): Promise<UserPlantDTO> => {
    const res = await api.post('/UserPlant', data);
    return res.data.data;
  },
  update: async (data: UpdateUserPlantDTO): Promise<void> => {
    await api.put('/UserPlant', data);
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/UserPlant/${id}`);
  },
  updateWatering: async (id: number, date: Date): Promise<void> => {
    await api.post(`/UserPlant/${id}/water`, { date: date.toISOString() });
  },
  updateFertilizing: async (id: number, date: Date): Promise<void> => {
    await api.post(`/UserPlant/${id}/fertilize`, { date: date.toISOString() });
  },
  updateStatus: async (id: number, status: string): Promise<void> => {
    await api.put(`/UserPlant/${id}/status`, { status });
  },
  getByStatus: async (status: string): Promise<UserPlantDTO[]> => {
    const res = await api.get(`/UserPlant/status/${status}`);
    return res.data.data;
  },
  search: async (term: string): Promise<UserPlantDTO[]> => {
    const res = await api.get(`/UserPlant/search?term=${term}`);
    return res.data.data;
  },
  getStatistics: async (): Promise<UserPlantStatisticsDTO> => {
    const res = await api.get('/UserPlant/statistics');
    return res.data.data;
  },
};

// CareSuggestion APIs
export const careSuggestionApi = {
  getGuide: async (productId: number): Promise<PlantCareGuideDTO> => {
    const res = await api.get(`/CareSuggestion/guide/${productId}`);
    return res.data.data;
  },
  getAllGuides: async (): Promise<PlantCareGuideDTO[]> => {
    const res = await api.get('/CareSuggestion/guides');
    return res.data.data;
  },
  searchGuides: async (term: string): Promise<PlantCareGuideDTO[]> => {
    const res = await api.get(`/CareSuggestion/guides/search?term=${term}`);
    return res.data.data;
  },
  getRecommendations: async (condition: UserConditionDTO): Promise<CareSuggestionDTO[]> => {
    const res = await api.post('/CareSuggestion/recommend', condition);
    return res.data.data;
  },
  getRecommendedPlants: async (condition: UserConditionDTO): Promise<ProductSuggestionDTO[]> => {
    const res = await api.post('/CareSuggestion/plants/recommend', condition);
    return res.data.data;
  },
  getHistory: async (): Promise<CareSuggestionDTO[]> => {
    const res = await api.get('/CareSuggestion/history');
    return res.data.data;
  },
};

export default api;
