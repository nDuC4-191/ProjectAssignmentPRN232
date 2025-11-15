import axios, { type AxiosRequestHeaders } from "axios";
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
} from "../types/userPlant.types";

// =============================
// CẤU HÌNH API URL
// =============================
const API_BASE_URL = "http://localhost:5239/api";

// =============================
// TẠO AXIOS INSTANCE
// =============================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// =============================
// INTERCEPTOR: GẮN JWT TOKEN
// =============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = (config.headers || {}) as AxiosRequestHeaders;
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =============================
// HÀM LẤY DỮ LIỆU CHUẨN
// =============================
const unwrap = (res: any) => {
  return res?.data?.data ?? res?.data ?? res;
};

// =============================
// UserPlant API
// =============================
export const userPlantApi = {
  getAll: async (): Promise<UserPlantDTO[]> =>
    unwrap(await api.get("/UserPlant")),

  getDetail: async (id: number): Promise<UserPlantDetailDTO> =>
    unwrap(await api.get(`/UserPlant/${id}`)),

  create: async (data: CreateUserPlantDTO): Promise<UserPlantDTO> =>
    unwrap(await api.post("/UserPlant", data)),

  update: async (data: UpdateUserPlantDTO): Promise<void> =>
    api.put("/UserPlant", data),

  delete: async (id: number): Promise<void> =>
    api.delete(`/UserPlant/${id}`),

  updateWatering: async (id: number, date: Date): Promise<void> =>
    api.post(`/UserPlant/${id}/water`, { date: date.toISOString() }),

  updateFertilizing: async (id: number, date: Date): Promise<void> =>
    api.post(`/UserPlant/${id}/fertilize`, { date: date.toISOString() }),

  updateStatus: async (id: number, status: string): Promise<void> =>
    api.put(`/UserPlant/${id}/status`, { status }),

  getByStatus: async (status: string): Promise<UserPlantDTO[]> =>
    unwrap(await api.get(`/UserPlant/status/${status}`)),

  search: async (term: string): Promise<UserPlantDTO[]> =>
    unwrap(await api.get(`/UserPlant/search`, { params: { term } })),

  getStatistics: async (): Promise<UserPlantStatisticsDTO> =>
    unwrap(await api.get("/UserPlant/statistics")),
};

// =============================
// CareSuggestion API
// =============================
export const careSuggestionApi = {
  getGuide: async (productId: number): Promise<PlantCareGuideDTO> =>
    unwrap(await api.get(`/CareSuggestion/guide/${productId}`)),

  getAllGuides: async (): Promise<PlantCareGuideDTO[]> =>
    unwrap(await api.get("/CareSuggestion/guides")),

  searchGuides: async (term: string): Promise<PlantCareGuideDTO[]> =>
    unwrap(await api.get(`/CareSuggestion/guides/search`, { params: { term } })),

  getRecommendations: async (condition: UserConditionDTO): Promise<CareSuggestionDTO[]> =>
    unwrap(await api.post("/CareSuggestion/recommend", condition)),

  getRecommendedPlants: async (condition: UserConditionDTO): Promise<ProductSuggestionDTO[]> =>
    unwrap(await api.post("/CareSuggestion/plants/recommend", condition)),

  getHistory: async (): Promise<CareSuggestionDTO[]> =>
    unwrap(await api.get("/CareSuggestion/history")),
};

export default api;
