import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart, refreshCart } = useCart();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    // 🔍 DEBUG: Xem cấu trúc dữ liệu
    useEffect(() => {
        if (cartItems.length > 0) {
            console.log('🔍 Cart Items Structure:', cartItems);
            console.log('🔍 First Item:', cartItems[0]);
            console.log('🔍 Available Keys:', Object.keys(cartItems[0]));
        }
    }, [cartItems]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = '/images/placeholder.png';
    };

    // ⭐ Handle remove with loading state
    const handleRemove = async (itemId: number, itemName: string) => {
        if (window.confirm(`Bạn có chắc muốn xóa "${itemName}" khỏi giỏ hàng?`)) {
            setIsLoading(true);
            try {
                await removeFromCart(itemId);
                console.log('✅ Removed item:', itemId);
            } catch (error) {
                console.error('❌ Failed to remove item:', error);
                alert('Không thể xóa sản phẩm. Vui lòng thử lại!');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // ⭐ Handle quantity change
    const handleQuantityChange = async (itemId: number, newQty: number) => {
        if (newQty <= 0) {
            return;
        }
        
        setIsLoading(true);
        try {
            await updateQuantity(itemId, newQty);
            console.log('✅ Updated quantity:', itemId, newQty);
        } catch (error) {
            console.error('❌ Failed to update quantity:', error);
            alert('Không thể cập nhật số lượng. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    // ⭐ Handle checkout
    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }
        console.log('🛒 Proceeding to checkout with items:', cartItems);
        navigate('/checkout');
    };

    const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">🛒</div>
                <h1 className="text-3xl font-bold mb-4">Giỏ hàng của bạn</h1>
                <p className="text-gray-600 mb-6">Giỏ hàng trống. Hãy thêm sản phẩm vào giỏ hàng!</p>
                <Link 
                    to="/" 
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
            
            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang xử lý...</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <div 
                            key={item.id}
                            className="flex items-center gap-4 border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
                        >
                            <img 
                                src={item.imageUrl || item.plantImage || '/images/placeholder.png'} 
                                alt={item.productName || item.plantName}
                                onError={handleImageError}
                                className="w-24 h-24 rounded-md object-cover"
                            />
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg">{item.productName || item.plantName}</h3>
                                <p className="text-gray-600">{item.price.toLocaleString()} VND</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                    <label className="text-xs text-gray-500 mb-1">Số lượng</label>
                                    <input 
                                        type="number" 
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const newQty = parseInt(e.target.value) || 1;
                                            handleQuantityChange(item.id, newQty);
                                        }}
                                        onBlur={(e) => {
                                            const newQty = parseInt(e.target.value);
                                            if (!newQty || newQty < 1) {
                                                handleQuantityChange(item.id, 1);
                                            }
                                        }}
                                        className="w-20 border border-gray-300 p-2 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:outline-none"
                                        min="1"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-xs text-gray-500 mb-1">Tổng</p>
                                    <p className="font-semibold text-lg text-green-600">
                                        {(item.price * item.quantity).toLocaleString()} VND
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleRemove(item.id, item.productName || item.plantName || 'sản phẩm')} 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-lg transition disabled:opacity-50"
                                    title="Xóa sản phẩm"
                                    disabled={isLoading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="lg:col-span-1">
                    <div className="bg-white border-2 border-gray-200 p-6 rounded-lg shadow-md sticky top-4">
                        <h2 className="text-2xl font-semibold mb-6">Tổng cộng</h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính:</span>
                                <span className="font-medium">{grandTotal.toLocaleString()} VND</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span className="font-medium text-green-600">Miễn phí</span>
                            </div>
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Số lượng sản phẩm:</span>
                                <span className="font-medium">{cartItems.length} sản phẩm</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-xl pt-4 border-t-2 border-gray-200">
                            <span>Thành tiền:</span>
                            <span className="text-green-600">{grandTotal.toLocaleString()} VND</span>
                        </div>
                        
                        <button
                            onClick={handleCheckout}
                            disabled={isLoading || cartItems.length === 0}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 mt-6 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Tiến hành thanh toán
                        </button>
                        
                        <Link 
                            to="/" 
                            className="text-green-600 text-center w-full block py-3 rounded-lg font-semibold hover:bg-green-50 mt-3 border-2 border-green-600 transition"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;