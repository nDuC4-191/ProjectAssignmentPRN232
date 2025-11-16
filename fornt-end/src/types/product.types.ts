// src/types/product.types.ts
// ============================================
// PRODUCT & RELATED TYPES – KHỚP VỚI BACKEND
// ============================================

// === PAGED RESULT ===
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
}

// === PRODUCT (KHỚP BACKEND - camelCase) ===
export interface Product {
  productId: number;        // ← CHỮ THƯỜNG 'd' (backend trả: productId)
  categoryID: number;       // Backend trả: categoryID
  categoryName?: string;    // Backend có trả trong JOIN
  productName: string;
  description?: string;
  price: number;
  stock: number;
  difficulty?: string;
  lightRequirement?: string;
  waterRequirement?: string;
  soilType?: string;
  imageUrl?: string;
  originalPrice?: number;
}

// === PRODUCT QUERY ===
export interface ProductQuery {
  pageNumber?: number;
  pageSize?: number;
  Search?: string;
  CategoryId?: number;
  MinPrice?: number;
  MaxPrice?: number;
  Difficulty?: string;
  LightRequirement?: string;
  WaterRequirement?: string;
}

// === CATEGORY ===
export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
}

// === FEEDBACK ===
export interface Feedback {
  feedbackId: number;
  userId: number;
  userName: string;
  productId: number;
  message?: string;
  imageUrl?: string;
  createdAt?: string;
}

// === CART ITEM ===
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

// === PRODUCT SUGGESTION ===
export interface ProductSuggestionDTO {
  productId: number;        // ← CHỮ THƯỜNG
  productName: string;
  price: number;
  imageUrl?: string;
  description?: string;
  difficulty: string;
  lightRequirement: string;
  waterRequirement: string;
}

// === USER CONDITION ===
export interface UserConditionDTO {
  lightAvailability: string;
  timeAvailable: string;
  experience: string;
}