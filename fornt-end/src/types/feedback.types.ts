// Path: src/types/feedback.types.ts

// DTO này tương ứng với CreateFeedbackDTO trên backend (C#)
export interface CreateFeedbackDTO {
  orderId: number;
  productId: number;
  message?: string;
  imageUrl?: string;
}