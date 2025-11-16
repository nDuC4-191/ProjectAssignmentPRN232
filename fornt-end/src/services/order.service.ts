// src/services/order.service.ts
import api from './api.service';
import type { 
  Order, 
  CreateOrderDTO, 
  OrderStatus,
  OrderSummaryDTO 
} from '../types/order.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const handleResponse = <T>(res: any, fallback: T): T => {
  return res.data?.data ?? res.data ?? fallback;
};

const handleError = (error: any, context: string): never => {
  const msg = error.response?.data?.message || error.message || 'Lỗi không xác định';
  console.error(`[OrderService - ${context}]:`, msg);
  throw new Error(msg);
};

// ==============================
// CHECKOUT
// ==============================
export const checkout = async (data: CreateOrderDTO): Promise<Order> => {
  try {
    console.log('Calling checkout:', data);
    const res = await api.post<ApiResponse<Order>>('/Orders/checkout', data);
    return handleResponse<Order>(res, {} as Order);
  } catch (error: any) {
    handleError(error, 'checkout');
    return {} as Order; // ← BẮT BUỘC: thêm dòng này
  }
};

// ==============================
// GET MY ORDERS
// ==============================
export const getMyOrders = async (): Promise<OrderSummaryDTO[]> => {
  try {
    const res = await api.get<ApiResponse<OrderSummaryDTO[]>>('/Orders/history');
    return handleResponse<OrderSummaryDTO[]>(res, []);
  } catch (error: any) {
    handleError(error, 'getMyOrders');
    return []; // ← thêm fallback
  }
};

// ==============================
// GET ORDER STATUS
// ==============================
export const getOrderStatus = async (orderId: number): Promise<OrderStatus> => {
  try {
    const res = await api.get<ApiResponse<OrderStatus>>(`/Orders/${orderId}/status`);
    return handleResponse<OrderStatus>(res, { 
      orderId, 
      currentStatus: 'Unknown', 
      lastUpdate: new Date().toISOString() 
    });
  } catch (error: any) {
    handleError(error, 'getOrderStatus');
    return { orderId, currentStatus: 'Unknown', lastUpdate: new Date().toISOString() };
  }
};

// ==============================
// GET ORDER DETAILS
// ==============================
export const getOrderDetails = async (orderId: number): Promise<Order> => {
  try {
    const res = await api.get<ApiResponse<Order>>(`/Orders/${orderId}/details`);
    return handleResponse<Order>(res, {} as Order);
  } catch (error: any) {
    handleError(error, 'getOrderDetails');
    return {} as Order;
  }
};

// ==============================
// EXPORT
// ==============================
export const orderService = {
  checkout,
  getMyOrders,
  getOrderStatus,
  getOrderDetails,
};