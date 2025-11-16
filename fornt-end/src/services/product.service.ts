// src/services/product.service.ts
import api from './api.service';
import type { PagedResult, Product, ProductQuery, Category, Feedback } from '../types/product.types';
import type { PlantCareGuideDTO } from '../types/userPlant.types';

// === UNWRAP AN TOÀN ===
const unwrap = (res: any): any => {
  return res?.data?.data ?? res?.data ?? res;
};

// === LẤY SẢN PHẨM (CÓ XỬ LÝ LỖI) ===
export const getProducts = async (query: ProductQuery): Promise<PagedResult<Product>> => {
  const params: any = {};
  if (query.pageNumber !== undefined) params.pageNumber = query.pageNumber;
  if (query.pageSize !== undefined) params.pageSize = query.pageSize;
  if (query.Search?.trim()) params.Search = query.Search.trim();
  if (query.CategoryId !== undefined) params.CategoryId = query.CategoryId;
  if (query.MinPrice !== undefined) params.MinPrice = query.MinPrice;
  if (query.MaxPrice !== undefined) params.MaxPrice = query.MaxPrice;
  if (query.Difficulty) params.Difficulty = query.Difficulty;
  if (query.LightRequirement) params.LightRequirement = query.LightRequirement;
  if (query.WaterRequirement) params.WaterRequirement = query.WaterRequirement;

  console.log('🔍 GỌI API /Products:', params);

  try {
    const res = await api.get('/Products', { params });
    const data = unwrap(res);

    // Backend trả về trực tiếp array, KHÔNG CÓ wrapper "items"
    const result: PagedResult<Product> = {
      items: Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []),
      totalCount: data.totalCount ?? (Array.isArray(data) ? data.length : 0),
      totalPages: data.totalPages ?? 1,
    };

    console.log('✅ API /Products TRẢ VỀ:', result);
    return result;
  } catch (error: any) {
    console.error('❌ LỖI API /Products:', error.response?.data || error.message);
    return { items: [], totalCount: 0, totalPages: 0 };
  }
};

// === LẤY DANH MỤC (CategorysController) ===
export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await api.get('/Categorys');
    const data = unwrap(res);
    console.log('✅ API /Categorys TRẢ VỀ:', data);
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('❌ LỖI API /Categorys:', error.response?.data || error.message);
    return [];
  }
};

// === CHI TIẾT SẢN PHẨM ===
export const getProductById = async (id: number): Promise<Product> => {
  try {
    const res = await api.get(`/Products/${id}`);
    const data = unwrap(res);
    
    console.log('🔍 RAW API Response:', data);
    
    // NORMALIZE: Backend trả productID/categoryID (chữ HOA)
    if (data.productID && !data.productId) {
      data.productId = data.productID;
    }
    if (data.categoryID && !data.categoryId) {
      data.categoryId = data.categoryID;
    }
    
    console.log('✅ Normalized Product:', data);
    return data;
  } catch (error: any) {
    console.error(`❌ Lỗi lấy sản phẩm ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// === HƯỚNG DẪN CHĂM SÓC ===
export const getCareGuide = async (id: number): Promise<PlantCareGuideDTO> => {
  try {
    const res = await api.get(`/CareSuggestion/guide/${id}`);
    return unwrap(res);
  } catch (error: any) {
    console.error(`❌ Lỗi lấy hướng dẫn ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// === ĐÁNH GIÁ ===
export const getFeedback = async (id: number): Promise<Feedback[]> => {
  try {
    const res = await api.get(`/Products/${id}/feedback`);
    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error(`❌ Lỗi lấy feedback ID ${id}:`, error.response?.data || error.message);
    return [];
  }
};

// === EXPORT ===
export const productService = {
  getProducts,
  getProductById,
  getCategories,
  getCareGuide,
  getFeedback,
};