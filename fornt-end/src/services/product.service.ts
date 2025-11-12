import api from './api.service';
// Import các types, đã thêm 'type'
import type { PagedResult, Product, ProductQuery, Category, Feedback } from '../types/product.types';
import type { PlantCareGuideDTO } from '../types/userPlant.types'; 
// ===========================

const getProducts = async (query: ProductQuery): Promise<PagedResult<Product>> => {
    const res = await api.get('/products', { params: query });
    return res.data; 
};

const getProductById = async (id: number): Promise<Product> => {
    const res = await api.get(`/products/${id}`);
    return res.data;
};

const getCategories = async (): Promise<Category[]> => {
    const res = await api.get('/categories');
    return res.data;
};

// === SỬA LỖI Ở DÒNG NÀY ===
// Sử dụng đúng tên type đã import: PlantCareGuideDTO
const getCareGuide = async (id: number): Promise<PlantCareGuideDTO> => {
    // Chúng ta gọi API của Vinh đã được định nghĩa trong api.service.ts
    // Dựa trên file api.service.ts:
    // - Endpoint là: /CareSuggestion/guide/{id}
    // - Dữ liệu trả về nằm trong 'res.data.data'
    const res = await api.get(`/CareSuggestion/guide/${id}`);
    return res.data.data; 
};
// ===========================

const getFeedback = async (id: number): Promise<Feedback[]> => {
    const res = await api.get(`/products/${id}/feedback`);
    return res.data;
};

export const productService = {
    getProducts,
    getProductById,
    getCategories,
    getCareGuide,
    getFeedback,
};