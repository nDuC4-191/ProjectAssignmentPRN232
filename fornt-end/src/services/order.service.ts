import api from './api.service';
import type { Order, CreateOrderDTO, OrderStatus } from '../types/order.types';

const checkout = async (data: CreateOrderDTO): Promise<Order> => {
    const res = await api.post('/order/checkout', data);
    return res.data;
};

const getOrderStatus = async (orderId: number): Promise<OrderStatus> => {
    const res = await api.get(`/order/${orderId}/status`);
    return res.data;
};

export const orderService = {
    checkout,
    getOrderStatus,
};