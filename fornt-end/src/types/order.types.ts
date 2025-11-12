// src/types/order.types.ts

// === DTO dùng cho phía Store (Cảnh / User) ===

// Địa chỉ giao hàng (checkout form)
export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  country: string;
}

// Tạo đơn hàng (gửi từ FE lên API)
export interface CreateOrderDTO {
  shippingAddress: ShippingAddress;
  paymentMethod: string; // "COD", "VNPAY", "MOMO"
  notes?: string;
}

// Sản phẩm trong đơn hàng
export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

// Chi tiết đơn hàng (FE dùng để hiển thị)
export interface Order {
  orderId: number;
  orderDate: string; // (là CreatedAt)
  status?: string;
  totalAmount: number;
  shippingAddress: ShippingAddress; // Backend DTO trả về
  orderItems: OrderItem[];
}

// Theo dõi trạng thái đơn hàng
export interface OrderStatus {
  orderId: number;
  currentStatus?: string;
  lastUpdate: string;
}

// === DTO dùng cho phía Admin (Nhật Lê) ===

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

// Enum trạng thái đơn hàng
export type OrderStatusType =
  | "Pending"
  | "Processing"
  | "Shipping"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export const ORDER_STATUSES: OrderStatusType[] = [
  "Pending",
  "Processing",
  "Shipping",
  "Delivered",
  "Completed",
  "Cancelled"
];
