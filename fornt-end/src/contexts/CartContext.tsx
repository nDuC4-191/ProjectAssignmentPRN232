// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cart.service';

interface CartItem {
  id: number;
  plantId: number;
  plantName: string;
  plantImage?: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart từ localStorage khi mount (offline mode)
  useEffect(() => {
    if (isAuthenticated) {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          setCartItems(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setCartItems([]);
        }
      }
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  // Sync cartItems to localStorage
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = async (item: CartItem) => {
    try {
      // Thử gọi API trước
      await cartService.addToCart(item.plantId, item.quantity);
      await refreshCart();
    } catch (error: any) {
      // Fallback: Update local state
      setCartItems(prev => {
        const existingItem = prev.find(i => i.plantId === item.plantId);
        if (existingItem) {
          return prev.map(i =>
            i.plantId === item.plantId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        }
        return [...prev, item];
      });
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      // ✅ Backend expects productId, not cartItemId
      const item = cartItems.find(i => i.id === itemId);
      if (item) {
        await cartService.removeFromCart(item.plantId);
        await refreshCart();
      }
    } catch (error: any) {
      // Fallback: Update local state
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      // ✅ Backend expects productId, not cartItemId
      const item = cartItems.find(i => i.id === itemId);
      if (item) {
        await cartService.updateQuantity(item.plantId, quantity);
        await refreshCart();
      }
    } catch (error: any) {
      // Fallback: Update local state
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
    } catch (error: any) {
      // Fallback: Clear local state
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const cartData = await cartService.getMyCart();
      setCartItems(cartData || []);
    } catch (error: any) {
      // Silent fail - không log gì
    }
  }, [isAuthenticated, token]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};