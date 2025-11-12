// DTO CartItemDTO (từ CartItem model + join)
export interface CartItem {
    productId: number;
    productName: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    totalPrice: number; // Backend DTO đã tính
}

// DTO CartDTO
export interface Cart {
    items: CartItem[];
    grandTotal: number;
    totalItems: number;
}

// DTO AddItemToCartDTO
export interface AddToCartDTO {
    productId: number;
    quantity: number;
}

// DTO UpdateCartItemDTO
export interface UpdateCartDTO {
    productId: number;
    newQuantity: number;
}