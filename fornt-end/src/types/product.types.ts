// src/types/product.types.ts
// ============================================
// PRODUCT & RELATED TYPES
// ============================================

// === PAGED RESULT (dùng cho danh sách phân trang) ===
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  totalItems: number; // ← Đảm bảo có để tránh lỗi TypeScript
}

// === PRODUCT (từ backend - PascalCase) ===
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
  originalPrice?: number; // ← Dùng cho giảm giá (nếu có)
}

// === PRODUCT QUERY (lọc & tìm kiếm) ===
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

// === CATEGORY ===
export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
}

// === FEEDBACK (đánh giá sản phẩm) ===
export interface Feedback {
  feedbackId: number;
  userId: number;
  userName: string;
  productId: number;
  message?: string;
  imageUrl?: string;
  createdAt?: string;
}

// ============================================
// NEW TYPES FOR ADD PLANT & CART
// ============================================

// === PRODUCT WITH camelCase ID (dùng trong Cart, AddPlant) ===
export interface ProductWithId extends Product {
  productId: number; // ← camelCase để đồng bộ với CartItem
}

// === PRODUCT OPTION (dùng cho dropdown chọn cây) ===
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

// === CART ITEM (dùng trong CartContext) ===
export interface CartItem {
  id: number; // temporary ID (frontend)
  productId: number; // ← camelCase
  productName: string;
  productImage?: string; // ← camelCase
  price: number;
  quantity: number;
}

// === USER PLANT SUGGESTION (nếu dùng ở gợi ý cây) ===
export interface ProductSuggestionDTO {
  productID: number;
  productName: string;
  price: number;
  imageUrl?: string;
  description?: string;
  difficulty: string;
  lightRequirement: string;
  waterRequirement: string;
}

export interface UserConditionDTO {
  lightAvailability: string;
  timeAvailable: string;
  experience: string;
}