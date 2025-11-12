// Path: src/contexts/CartContext.tsx
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
// Sửa lỗi 'verbatimModuleSyntax'
import type { Cart, AddToCartDTO, UpdateCartDTO } from '../types/cart.types';
import { cartService } from '../services/cart.service';
import { useAuth } from './AuthContext'; // Import từ file AuthContext

// Định nghĩa 'shape' của Context
interface CartContextType {
    cart: Cart | null;
    cartItemCount: number;
    loading: boolean;
    fetchCart: () => Promise<void>;
    addItemToCart: (item: AddToCartDTO) => Promise<void>;
    updateItemInCart: (item: UpdateCartDTO) => Promise<void>;
    removeItemFromCart: (productId: number) => Promise<void>;
}

// Tạo Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Tạo Provider
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth(); // Lấy trạng thái đăng nhập

    const fetchCart = async () => {
        if (!isAuthenticated) {
            setCart(null); // Không có giỏ hàng nếu chưa đăng nhập
            return;
        }
        setLoading(true);
        try {
            // Service trả về 'Cart'
            const cartData = await cartService.getMyCart();
            setCart(cartData);
        } catch (error) {
            console.error('Failed to fetch cart', error);
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    // Tự động tải giỏ hàng khi trạng thái đăng nhập thay đổi
    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    const addItemToCart = async (item: AddToCartDTO) => {
        if (!isAuthenticated) return alert('Bạn cần đăng nhập để thêm vào giỏ hàng');
        try {
            // Sửa lỗi logic tương tự
            const updatedCart = await cartService.addItem(item);
            setCart(updatedCart);
        } catch (error) { console.error('Failed to add item', error); }
    };

    const updateItemInCart = async (item: UpdateCartDTO) => {
        if (!isAuthenticated) return;
        try {
            const updatedCart = await cartService.updateItem(item);
            setCart(updatedCart);
        } catch (error) { console.error('Failed to update item', error); }
    };

    const removeItemFromCart = async (productId: number) => {
        if (!isAuthenticated) return;
        try {
            const updatedCart = await cartService.removeItem(productId);
            setCart(updatedCart);
        } catch (error) { console.error('Failed to remove item', error); }
    };

    // Tính toán số lượng item
    const cartItemCount = cart?.totalItems ?? 0;

    // Return (phần JSX)
    return (
        <CartContext.Provider value={{ 
            cart, 
            cartItemCount, 
            loading, 
            fetchCart, 
            addItemToCart, 
            updateItemInCart, 
            removeItemFromCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook tùy chỉnh
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};