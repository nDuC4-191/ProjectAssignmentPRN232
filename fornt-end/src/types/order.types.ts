// src/types/order.types.ts

// === RESPONSE WRAPPER (Backend luôn trả về) ===
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// === USER SIDE (Store / Customer) ===

/** Địa chỉ giao hàng */
export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  country: string;
}

/** Gửi lên khi đặt hàng */
export interface CreateOrderDTO {
  shippingAddress: ShippingAddress;
  paymentMethod: 'COD' | 'VNPAY' | 'MOMO';
  notes?: string;
}

/** Sản phẩm trong đơn */
export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

/** Chi tiết đơn hàng (dùng cho OrderSuccessPage) */
export interface Order {
  orderId: number;
  orderDate: string;
  status?: string;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  orderItems: OrderItem[];
}

/** Trạng thái đơn hàng (dùng cho theo dõi) */
export interface OrderStatus {
  orderId: number;
  currentStatus?: string;
  lastUpdate: string;
}

/** Tóm tắt đơn hàng (dùng cho OrdersPage - /history) */
export interface OrderSummaryDTO {
  orderId: number;
  orderDate: string;
  status?: string;
  totalAmount: number;
}

// === ADMIN SIDE ===

export interface OrderListDTO {
  orderId: number;
  userId: number;
  userName: string;
  userEmail: string;
  address: string | null;
  paymentMethod: string | null;
  totalAmount: number | null;
  status: string | null;
  totalItems: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface OrderItemDTO {
  orderDetailId: number;
  productId: number;
  productName: string;
  productImage: string | null;
  quantity: number | null;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDetailDTO {
  orderId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  address: string | null;
  paymentMethod: string | null;
  totalAmount: number | null;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  orderItems: OrderItemDTO[];
}

export interface UpdateOrderStatusDTO {
  status: string;
}

export interface OrderStatisticsDTO {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippingOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

// === ENUM TRẠNG THÁI ===
export type OrderStatusType =
  | 'Pending'
  | 'Processing'
  | 'Shipping'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export const ORDER_STATUSES: OrderStatusType[] = [
  'Pending',
  'Processing',
  'Shipping',
  'Delivered',
  'Completed',
  'Cancelled',
];