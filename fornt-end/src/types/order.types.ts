// DTO ShippingAddressDTO (cho form)
export interface ShippingAddress {
    fullName: string;
    phoneNumber: string;
    addressLine: string;
    city: string;
    country: string;
}

// DTO CreateOrderDTO (gửi lên API)
export interface CreateOrderDTO {
    shippingAddress: ShippingAddress;
    paymentMethod: string; // "COD", "VNPAY", "MOMO"
    notes?: string;
}

// DTO OrderItemDTO (từ OrderDetail model)
export interface OrderItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
}

// DTO OrderDTO (từ Order model)
export interface Order {
    orderId: number;
    orderDate: string; // (là CreatedAt)
    status?: string;
    totalAmount: number;
    shippingAddress: ShippingAddress; // Backend DTO trả về
    orderItems: OrderItem[];
}

// DTO OrderStatusDTO
export interface OrderStatus {
    orderId: number;
    currentStatus?: string;
    lastUpdate: string;
}