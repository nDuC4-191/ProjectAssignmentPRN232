// src/services/orderApi.service.ts
import api from './api.service';
import type { 
  OrderListDTO, 
  OrderDetailDTO, 
  UpdateOrderStatusDTO,
  OrderStatisticsDTO 
} from '../types/order.types';

export const orderApi = {
  // Get all orders with optional filters
  getOrders: async (status?: string, searchTerm?: string): Promise<OrderListDTO[]> => {
    let url = '/admin/orders';
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (searchTerm) params.append('searchTerm', searchTerm);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const res = await api.get(url);
    return res.data;
  },

  // Get order detail by ID
  getOrderById: async (id: number): Promise<OrderDetailDTO> => {
    const res = await api.get(`/admin/orders/${id}`);
    return res.data;
  },

  // Update order status
  updateOrderStatus: async (id: number, data: UpdateOrderStatusDTO): Promise<void> => {
    await api.patch(`/admin/orders/${id}/status`, data);
  },

  // Get order statistics
  getStatistics: async (): Promise<OrderStatisticsDTO> => {
    const res = await api.get('/admin/orders/statistics');
    return res.data;
  },
};