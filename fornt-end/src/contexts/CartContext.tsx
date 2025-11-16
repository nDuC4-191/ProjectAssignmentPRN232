// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cart.service';

// ============================================
// CART ITEM TYPE
// ============================================
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // === LOAD CART FROM LOCALSTORAGE ===
  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems([]);
      localStorage.removeItem('cart');
      return;
    }

    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      } catch (e) {
        console.error('Failed to parse cart:', e);
        localStorage.removeItem('cart');
      }
    }
  }, [isAuthenticated]);

  // === SYNC TO LOCALSTORAGE ===
  useEffect(() => {
    if (isAuthenticated && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else if (!isAuthenticated) {
      localStorage.removeItem('cart');
    }
  }, [cartItems, isAuthenticated]);

  // === REFRESH CART KHI LOGIN/LOGOUT ===
  useEffect(() => {
    if (isAuthenticated && token) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, token]);

  // === REFRESH FROM API ===
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setCartItems([]);
      return;
    }

    try {
      const data = await cartService.getMyCart();
      if (data?.items && Array.isArray(data.items)) {
        const mapped: CartItem[] = data.items.map((item: any, idx: number) => ({
          id: Date.now() + idx,
          productId: item.productId,
          productName: item.productName,
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
        }));
        setCartItems(mapped);
      } else {
        setCartItems([]);
      }
    } catch (error: any) {
      console.error('Refresh cart failed:', error);
    }
  }, [isAuthenticated, token]);

  // === ADD TO CART ===
  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    // Xử lý cả productId và productID (fallback)
    const productId = item.productId || (item as any).productID;
    
    if (!productId) {
      console.error('❌ Item không có productId:', item);
      throw new Error('Thiếu ID sản phẩm');
    }

    try {
      await cartService.addToCart(productId, item.quantity);
      await refreshCart();
    } catch (error: any) {
      console.warn('API failed, using local cart:', error);
      setCartItems(prev => {
        const existing = prev.find(i => i.productId === productId);
        if (existing) {
          return prev.map(i =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        }
        return [...prev, { ...item, id: Date.now(), productId }];
      });
    }
  };

  // === REMOVE ===
  const removeFromCart = async (itemId: number) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item?.productId) return;

    try {
      await cartService.removeFromCart(item.productId);
      await refreshCart();
    } catch (error: any) {
      console.warn('API failed, using local cart:', error);
      setCartItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  // === UPDATE QUANTITY ===
  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const item = cartItems.find(i => i.id === itemId);
    if (!item?.productId) return;

    try {
      await cartService.updateQuantity(item.productId, quantity);
      await refreshCart();
    } catch (error: any) {
      console.warn('API failed, using local cart:', error);
      setCartItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  // === CLEAR ===
  const clearCart = async () => {
    try {
      await cartService.clearCart();
    } catch (error: any) {
      console.warn('API clear failed:', error);
    } finally {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

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

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};