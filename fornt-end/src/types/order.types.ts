// src/types/order.types.ts

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

export type OrderStatus = 
  | "Pending" 
  | "Processing" 
  | "Shipping" 
  | "Delivered" 
  | "Completed" 
  | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing", 
  "Shipping",
  "Delivered",
  "Completed",
  "Cancelled"
];