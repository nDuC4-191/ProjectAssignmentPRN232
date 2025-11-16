// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cart.service';

// ============================================
// CART ITEM TYPE (chuẩn backend + alias cũ)
// ============================================
export interface CartItem {
  id: number;                    // Frontend temporary ID
  productId: number;             // Backend field
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;

  // Alias để tương thích với code cũ (plantId, plantName, plantImage)
  plantId?: number;
  plantName?: string;
  plantImage?: string;
}

// ============================================
// CART CONTEXT TYPE
// ============================================
export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;             // Tổng số lượng sản phẩm
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================
const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // === LOAD CART FROM LOCALSTORAGE (offline mode) ===
  useEffect(() => {
    if (isAuthenticated) {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        } catch (e) {
          console.error('Failed to parse cart from localStorage:', e);
          localStorage.removeItem('cart');
        }
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  }, [isAuthenticated]);

  // === SYNC CART TO LOCALSTORAGE ===
  useEffect(() => {
    if (isAuthenticated && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // === ADD TO CART ===
  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    const productId = item.productId || (item as any).plantId;
    if (!productId) {
      alert('Lỗi: Thiếu ID sản phẩm!');
      return;
    }

    try {
      await cartService.addToCart(productId, item.quantity);
      await refreshCart();
    } catch (error: any) {
      console.warn('API addToCart failed, using local fallback:', error);
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

  // === REMOVE FROM CART ===
  const removeFromCart = async (itemId: number) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    const productId = item.productId;
    if (!productId) {
      alert('Lỗi: Không tìm thấy sản phẩm để xóa!');
      return;
    }

    try {
      await cartService.removeFromCart(productId);
      await refreshCart();
    } catch (error: any) {
      console.warn('API removeFromCart failed, using local fallback:', error);
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
    if (!item || !item.productId) return;

    try {
      await cartService.updateQuantity(item.productId, quantity);
      await refreshCart();
    } catch (error: any) {
      console.warn('API updateQuantity failed, using local fallback:', error);
      setCartItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  // === CLEAR CART ===
  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
      localStorage.removeItem('cart');
    } catch (error: any) {
      console.warn('API clearCart failed, using local fallback:', error);
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  // === REFRESH CART FROM API ===
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const data = await cartService.getMyCart();
      if (data?.items && Array.isArray(data.items)) {
        const mapped: CartItem[] = data.items.map((item: any, idx: number) => ({
          id: idx + 1,
          productId: item.productId,
          productName: item.productName,
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
          plantId: item.productId,
          plantName: item.productName,
          plantImage: item.imageUrl,
        }));
        setCartItems(mapped);
      } else {
        setCartItems([]);
      }
    } catch (error: any) {
      console.error('Failed to refresh cart:', error);
      // Keep local cart
    }
  }, [isAuthenticated, token]);

  // === CART COUNT ===
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // === PROVIDE CONTEXT ===
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

// ============================================
// HOOK
// ============================================
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};