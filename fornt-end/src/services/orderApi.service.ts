// src/services/orderApi.service.ts
import api from './api.service';
import type { 
  OrderListDTO, 
  OrderDetailDTO, 
  UpdateOrderStatusDTO,
  OrderStatisticsDTO 
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
  console.error(`[OrderApi - ${context}]:`, msg);
  throw new Error(msg);
};

export const orderApi = {
  // === GET ORDERS ===
  getOrders: async (status?: string, searchTerm?: string): Promise<OrderListDTO[]> => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (searchTerm) params.append('searchTerm', searchTerm);

      const url = `/admin/orders${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await api.get<ApiResponse<OrderListDTO[]>>(url);
      return handleResponse<OrderListDTO[]>(res, []);
    } catch (error: any) {
      handleError(error, 'getOrders');
      return []; // ← THÊM DÒNG NÀY
    }
  },

  // === GET ORDER BY ID ===
  getOrderById: async (id: number): Promise<OrderDetailDTO> => {
    try {
      const res = await api.get<ApiResponse<OrderDetailDTO>>(`/admin/orders/${id}`);
      return handleResponse<OrderDetailDTO>(res, {} as OrderDetailDTO);
    } catch (error: any) {
      handleError(error, 'getOrderById');
      return {} as OrderDetailDTO; // ← THÊM DÒNG NÀY
    }
  },

  // === UPDATE STATUS ===
  updateOrderStatus: async (id: number, data: UpdateOrderStatusDTO): Promise<void> => {
    try {
      await api.patch(`/admin/orders/${id}/status`, data);
    } catch (error: any) {
      handleError(error, 'updateOrderStatus');
      return; // ← THÊM DÒNG NÀY (Promise<void>)
    }
  },

  // === GET STATISTICS ===
  getStatistics: async (): Promise<OrderStatisticsDTO> => {
    try {
      const res = await api.get<ApiResponse<OrderStatisticsDTO>>('/admin/orders/statistics');
      return handleResponse<OrderStatisticsDTO>(res, {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippingOrders: 0,
        deliveredOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0
      });
    } catch (error: any) {
      handleError(error, 'getStatistics');
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippingOrders: 0,
        deliveredOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0
      }; // ← THÊM DÒNG NÀY
    }
  },
};