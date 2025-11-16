// src/services/cart.service.ts
import api from './api.service';

export interface CartItem {
  id: number;
  plantId: number;
  plantName: string;
  plantImage?: string;
  price: number;
  quantity: number;
}

export interface CartResponse {
  items: CartItem[];
  grandTotal: number;
}

// ✅ Sửa cho đúng với backend .NET
export const cartService = {
  // GET: api/Carts
  getMyCart: async (): Promise<CartItem[]> => {
    try {
      const response = await api.get('/Carts');
      const data = response.data?.data || response.data;
      return data?.items || [];
    } catch {
      return [];
    }
  },

  // POST: api/Carts/add
  addToCart: async (plantId: number, quantity: number): Promise<void> => {
    try {
      await api.post('/Carts/add', { 
        productId: plantId, 
        quantity: quantity 
      });
    } catch {
      // Silent fail
    }
  },

  // PUT: api/Carts/update
  updateQuantity: async (itemId: number, quantity: number): Promise<void> => {
    try {
      await api.put('/Carts/update', { 
        productId: itemId, 
        newQuantity: quantity 
      });
    } catch {
      // Silent fail
    }
  },

  // DELETE: api/Carts/remove/{productId}
  removeFromCart: async (productId: number): Promise<void> => {
    try {
      await api.delete(`/Carts/remove/${productId}`);
    } catch {
      // Silent fail
    }
  },

  // Xóa toàn bộ giỏ hàng (nếu backend có endpoint này)
  clearCart: async (): Promise<void> => {
    try {
      await api.delete('/Carts');
    } catch {
      // Silent fail
    }
  },
};