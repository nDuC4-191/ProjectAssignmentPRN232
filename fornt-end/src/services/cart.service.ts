import api from './api.service';
import type { Cart, AddToCartDTO, UpdateCartDTO } from '../types/cart.types';

const getMyCart = async (): Promise<Cart> => {
    const res = await api.get('/cart');
    return res.data;
};

const addItem = async (item: AddToCartDTO): Promise<Cart> => {
    const res = await api.post('/cart/add', item);
    return res.data;
};

const updateItem = async (item: UpdateCartDTO): Promise<Cart> => {
    const res = await api.put('/cart/update', item);
    return res.data;
};

const removeItem = async (productId: number): Promise<Cart> => {
    const res = await api.delete(`/cart/remove/${productId}`);
    return res.data;
};

export const cartService = {
    getMyCart,
    addItem,
    updateItem,
    removeItem
};