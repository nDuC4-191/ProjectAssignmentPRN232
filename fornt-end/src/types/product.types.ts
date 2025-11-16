// src/types/product.types.ts

// ============================================
// ⭐ EXISTING TYPES (giữ nguyên code cũ)
// ============================================

// DTO PagedResult (từ lỗi CS0246)
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// DTO ProductDADto (từ Product model)
export interface Product {
  productID: number;
  categoryID: number;
  productName: string;
  description?: string;
  price: number;
  stock: number;
  difficulty?: string;
  lightRequirement?: string;
  waterRequirement?: string;
  imageUrl?: string;
}

// DTO ProductQueryParameters (từ backend)
export interface ProductQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  difficulty?: string;
  lightRequirement?: string;
  waterRequirement?: string;
}

// DTO CategoryDADTO (từ Category model)
export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
}

// DTO FeedbackDTO (từ Feedback model)
export interface Feedback {
  feedbackId: number;
  userId: number;
  userName: string; // Đã join ở backend
  productId: number;
  message?: string;
  imageUrl?: string;
  createdAt?: string; // (DateTime)
}

// ============================================
// ⭐ NEW TYPES (thêm cho AddPlantPage)
// ============================================

// Type alias để mapping giữa backend (productID) và frontend (productId)
export interface ProductWithId extends Product {
  productId: number; // ⭐ Thêm property camelCase để dễ dùng
}

// Helper type cho dropdown selection
export interface ProductOption {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  difficulty?: string;
  waterRequirement?: string;
  lightRequirement?: string;
}