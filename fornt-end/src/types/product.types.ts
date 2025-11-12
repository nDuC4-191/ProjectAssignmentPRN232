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