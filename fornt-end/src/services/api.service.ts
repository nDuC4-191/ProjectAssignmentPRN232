// src/services/api.service.ts
import axios, { type AxiosRequestHeaders, type AxiosInstance } from "axios";
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
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5239/api";

console.log('=== API SERVICE CONFIG ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('API_BASE_URL used:', API_BASE_URL);

// =============================
// TẠO AXIOS INSTANCE
// =============================
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================
// REQUEST INTERCEPTOR: GẮN JWT TOKEN + LOGGING
// =============================
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = (config.headers || {}) as AxiosRequestHeaders;
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request (chỉ trong development)
    if (import.meta.env.DEV) {
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log('🚀 API Request:', config.method?.toUpperCase(), fullUrl);
      if (config.params) {
        console.log('   Params:', config.params);
      }
      if (config.data && config.method !== 'get') {
        console.log('   Data:', config.data);
      }
    }

    return config;
  },
  (error) => {
    console.error('🚨 Request Error:', error);
    return Promise.reject(error);
  }
);

// =============================
// RESPONSE INTERCEPTOR: XỬ LÝ ERRORS
// =============================
api.interceptors.response.use(
  (response) => {
    // Log response (chỉ trong development)
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', response.status, response.data);
    }
    return response;
  },
  (error) => {
    // Log error
    console.error('❌ API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    });

    // Xử lý 401 Unauthorized - Token hết hạn
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      
      // Không redirect nếu đang ở trang public
      if (!currentPath.includes('/login') && 
          !currentPath.includes('/register') &&
          !currentPath.includes('/forgot-password') &&
          !currentPath.includes('/reset-password') &&
          !currentPath.includes('/verify-email')) {
        console.warn('⚠️ Unauthorized - Redirecting to login');
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }

    // Xử lý 403 Forbidden - Không có quyền truy cập
    if (error.response?.status === 403) {
      console.error('🚫 Forbidden - Access denied');
    }

    // Xử lý 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('💥 Server Error:', error.response?.data);
    }

    // Xử lý timeout
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout');
      error.message = 'Yêu cầu hết thời gian chờ. Vui lòng thử lại!';
    }

    // Xử lý network error
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error');
      error.message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối!';
    }

    return Promise.reject(error);
  }
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
  // Lấy tất cả cây của user
  getAll: async (): Promise<UserPlantDTO[]> =>
    unwrap(await api.get("/UserPlant")),

  // Lấy chi tiết 1 cây
  getDetail: async (id: number): Promise<UserPlantDetailDTO> =>
    unwrap(await api.get(`/UserPlant/${id}`)),

  // Thêm cây mới
  create: async (data: CreateUserPlantDTO): Promise<UserPlantDTO> =>
    unwrap(await api.post("/UserPlant", data)),

  // Cập nhật thông tin cây
  update: async (data: UpdateUserPlantDTO): Promise<void> =>
    api.put("/UserPlant", data),

  // Xóa cây
  delete: async (id: number): Promise<void> =>
    api.delete(`/UserPlant/${id}`),

  // Cập nhật lần tưới nước
  updateWatering: async (id: number, date: Date): Promise<void> =>
    api.post(`/UserPlant/${id}/water`, { date: date.toISOString() }),

  // Cập nhật lần bón phân
  updateFertilizing: async (id: number, date: Date): Promise<void> =>
    api.post(`/UserPlant/${id}/fertilize`, { date: date.toISOString() }),

  // Cập nhật trạng thái cây
  updateStatus: async (id: number, status: string): Promise<void> =>
    api.put(`/UserPlant/${id}/status`, { status }),

  // Lấy cây theo trạng thái
  getByStatus: async (status: string): Promise<UserPlantDTO[]> =>
    unwrap(await api.get(`/UserPlant/status/${status}`)),

  // Tìm kiếm cây
  search: async (term: string): Promise<UserPlantDTO[]> =>
    unwrap(await api.get(`/UserPlant/search`, { params: { term } })),

  // Lấy thống kê
  getStatistics: async (): Promise<UserPlantStatisticsDTO> =>
    unwrap(await api.get("/UserPlant/statistics")),
};

// =============================
// CareSuggestion API
// =============================
export const careSuggestionApi = {
  // Lấy hướng dẫn chăm sóc cho 1 sản phẩm
  getGuide: async (productId: number): Promise<PlantCareGuideDTO> =>
    unwrap(await api.get(`/CareSuggestion/guide/${productId}`)),

  // Lấy tất cả hướng dẫn
  getAllGuides: async (): Promise<PlantCareGuideDTO[]> =>
    unwrap(await api.get("/CareSuggestion/guides")),

  // Tìm kiếm hướng dẫn
  searchGuides: async (term: string): Promise<PlantCareGuideDTO[]> =>
    unwrap(await api.get(`/CareSuggestion/guides/search`, { params: { term } })),

  // Gợi ý chăm sóc dựa trên điều kiện
  getRecommendations: async (condition: UserConditionDTO): Promise<CareSuggestionDTO[]> =>
    unwrap(await api.post("/CareSuggestion/recommend", condition)),

  // Gợi ý cây phù hợp dựa trên điều kiện
  getRecommendedPlants: async (condition: UserConditionDTO): Promise<ProductSuggestionDTO[]> =>
    unwrap(await api.post("/CareSuggestion/plants/recommend", condition)),

  // Lấy lịch sử gợi ý
  getHistory: async (): Promise<CareSuggestionDTO[]> =>
    unwrap(await api.get("/CareSuggestion/history")),
};

// =============================
// EXPORT DEFAULT API INSTANCE
// =============================
export default api;