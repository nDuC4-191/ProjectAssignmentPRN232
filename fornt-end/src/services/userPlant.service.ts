// ============================================
// FIXED UserPlant Service - Đúng tên types
// Path: src/services/userPlant.service.ts
// ============================================
import axios from 'axios';
import type { 
    UserPlantDTO,              // ⭐ Đổi từ UserPlant → UserPlantDTO
    CreateUserPlantDTO, 
    UpdateUserPlantDTO,
    UserPlantDetailDTO,        // ⭐ Đổi từ UserPlantDetail → UserPlantDetailDTO
    UpdateCareDTO,
    UpdateStatusDTO,
    UserPlantStatisticsDTO     // ⭐ Đổi từ UserPlantStatistics → UserPlantStatisticsDTO
} from '../types/userPlant.types';

const API_URL = 'http://localhost:5239/api/UserPlant';

// Tạo axios instance với token tự động
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động thêm token vào mỗi request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const userPlantService = {
    // GET /api/userplant - Lấy danh sách cây của user
    getUserPlants: async (): Promise<UserPlantDTO[]> => {
        const response = await axiosInstance.get('');
        return response.data.data;
    },

    // GET /api/userplant/{id} - Lấy chi tiết một cây
    getUserPlantDetail: async (id: number): Promise<UserPlantDetailDTO> => {
        const response = await axiosInstance.get(`/${id}`);
        return response.data.data;
    },

    // POST /api/userplant - Thêm cây mới
    addUserPlant: async (dto: CreateUserPlantDTO): Promise<UserPlantDTO> => {
        const response = await axiosInstance.post('', dto);
        return response.data.data;
    },

    // PUT /api/userplant - Cập nhật thông tin cây
    updateUserPlant: async (dto: UpdateUserPlantDTO): Promise<void> => {
        await axiosInstance.put('', dto);
    },

    // DELETE /api/userplant/{id} - Xóa cây
    deleteUserPlant: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/${id}`);
    },

    // POST /api/userplant/{id}/water - Cập nhật lần tưới nước
    updateWatering: async (id: number, dto: UpdateCareDTO): Promise<void> => {
        await axiosInstance.post(`/${id}/water`, dto);
    },

    // POST /api/userplant/{id}/fertilize - Cập nhật lần bón phân
    updateFertilizing: async (id: number, dto: UpdateCareDTO): Promise<void> => {
        await axiosInstance.post(`/${id}/fertilize`, dto);
    },

    // PUT /api/userplant/{id}/status - Cập nhật trạng thái cây
    updatePlantStatus: async (id: number, dto: UpdateStatusDTO): Promise<void> => {
        await axiosInstance.put(`/${id}/status`, dto);
    },

    // GET /api/userplant/status/{status} - Lọc cây theo trạng thái
    getPlantsByStatus: async (status: string): Promise<UserPlantDTO[]> => {
        const response = await axiosInstance.get(`/status/${encodeURIComponent(status)}`);
        return response.data.data;
    },

    // GET /api/userplant/search?term=xxx - Tìm kiếm cây
    searchUserPlants: async (term: string): Promise<UserPlantDTO[]> => {
        const response = await axiosInstance.get('/search', {
            params: { term }
        });
        return response.data.data;
    },

    // GET /api/userplant/statistics - Thống kê
    getUserPlantStatistics: async (): Promise<UserPlantStatisticsDTO> => {
        const response = await axiosInstance.get('/statistics');
        return response.data.data;
    }
};

// ============================================
// SUMMARY - Đã sửa
// ============================================
/*
✅ Đã sửa các type names:
   - UserPlant → UserPlantDTO
   - UserPlantDetail → UserPlantDetailDTO  
   - UserPlantStatistics → UserPlantStatisticsDTO

⚠️ Lý do lỗi:
   - File types của bạn export: UserPlantDTO
   - Service đang import: UserPlant (không tồn tại)
   
✅ Giờ import đúng tên từ file types rồi!
*/