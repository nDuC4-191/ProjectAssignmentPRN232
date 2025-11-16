// src/services/cart.service.ts
import api from './api.service';

// ✅ Interface khớp với backend response
export interface CartItem {
  productId: number;      // Backend trả về productId
  productName: string;    // Backend trả về productName
  imageUrl?: string;      // Backend trả về imageUrl
  price: number;
  quantity: number;
  totalPrice: number;     // Backend trả về totalPrice
}

export interface CartResponse {
  items: CartItem[];
  grandTotal: number;
  totalItems: number;
}

// ✅ Service khớp với backend API
export const cartService = {
  // GET: api/Carts
  getMyCart: async (): Promise<CartResponse> => {
    try {
      const response = await api.get('/Carts');
      
      // Backend trả về: { items: [...], grandTotal: ..., totalItems: ... }
      const data = response.data?.data || response.data;
      
      return {
        items: data?.items || [],
        grandTotal: data?.grandTotal || 0,
        totalItems: data?.totalItems || 0
      };
    } catch (error) {
      console.error('❌ Failed to get cart:', error);
      return {
        items: [],
        grandTotal: 0,
        totalItems: 0
      };
    }
  },

  // POST: api/Carts/add
  addToCart: async (productId: number, quantity: number): Promise<void> => {
    try {
      await api.post('/Carts/add', { 
        productId: productId,  // Backend expects productId
        quantity: quantity 
      });
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      throw error; // Re-throw để CartContext catch
    }
  },

  // PUT: api/Carts/update
  updateQuantity: async (productId: number, newQuantity: number): Promise<void> => {
    try {
      await api.put('/Carts/update', { 
        productId: productId,      // Backend expects productId
        newQuantity: newQuantity   // Backend expects newQuantity
      });
    } catch (error) {
      console.error('❌ Failed to update quantity:', error);
      throw error;
    }
  },

  // DELETE: api/Carts/remove/{productId}
  removeFromCart: async (productId: number): Promise<void> => {
    try {
      await api.delete(`/Carts/remove/${productId}`);
    } catch (error) {
      console.error('❌ Failed to remove from cart:', error);
      throw error;
    }
  },

  // DELETE: api/Carts
  clearCart: async (): Promise<void> => {
    try {
      await api.delete('/Carts');
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
      throw error;
    }
  },
};