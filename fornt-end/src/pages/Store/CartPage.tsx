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

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400';
    };

    const handleRemove = async (itemId: number, itemName: string) => {
        if (window.confirm(`Bạn có chắc muốn xóa "${itemName}" khỏi giỏ hàng?`)) {
            setIsLoading(true);
            try {
                await removeFromCart(itemId);
            } catch (error) {
                console.error('Failed to remove item:', error);
                alert('Không thể xóa sản phẩm. Vui lòng thử lại!');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleQuantityChange = async (itemId: number, newQty: number) => {
        if (newQty <= 0) return;
        
        setIsLoading(true);
        try {
            await updateQuantity(itemId, newQty);
        } catch (error) {
            console.error('Failed to update quantity:', error);
            alert('Không thể cập nhật số lượng. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }
        navigate('/checkout');
    };

    const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="text-center py-20 px-6">
                    <div className="text-9xl mb-8 animate-bounce">🛒</div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                        Giỏ Hàng Trống
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
                        Hãy khám phá cửa hàng và thêm những cây cảnh yêu thích vào giỏ hàng!
                    </p>
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                        <span className="text-2xl">🌿</span>
                        <span>Khám Phá Cửa Hàng</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <span className="text-7xl">🛒</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                        Giỏ Hàng Của Bạn
                    </h1>
                    <p className="text-lg text-gray-600">
                        Bạn có <span className="font-bold text-green-600">{totalItems}</span> sản phẩm trong giỏ hàng
                    </p>
                </div>
                
                {/* Loading overlay */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center">
                            <div className="relative inline-block">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
                                <span className="absolute inset-0 flex items-center justify-center text-2xl">🌿</span>
                            </div>
                            <p className="mt-6 text-gray-700 font-semibold text-lg">Đang xử lý...</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {cartItems.map(item => (
                            <div 
                                key={item.id}
                                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 border-2 border-gray-100 hover:border-green-200"
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                    {/* Image */}
                                    <div className="relative flex-shrink-0">
                                        <img 
                                            src={item.imageUrl || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'} 
                                            alt={item.productName}
                                            onError={handleImageError}
                                            className="w-32 h-32 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-grow min-w-0">
                                        <Link 
                                            to={`/products/${item.productId}`}
                                            className="font-bold text-2xl text-gray-800 hover:text-green-600 transition-colors block mb-2 line-clamp-2"
                                        >
                                            {item.productName}
                                        </Link>
                                        <p className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                            {item.price.toLocaleString('vi-VN')}₫
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border-2 border-gray-200">
                                        <label className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Số lượng</label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                disabled={isLoading || item.quantity <= 1}
                                                className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl hover:bg-green-50 hover:border-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-sm hover:shadow-md"
                                            >
                                                −
                                            </button>
                                            <input 
                                                type="number" 
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newQty = parseInt(e.target.value) || 1;
                                                    if (newQty > 0) {
                                                        handleQuantityChange(item.id, newQty);
                                                    }
                                                }}
                                                className="w-16 text-center border-2 border-gray-300 p-2 rounded-xl font-bold text-lg focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all"
                                                min="1"
                                                disabled={isLoading}
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                disabled={isLoading}
                                                className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl hover:bg-green-50 hover:border-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-sm hover:shadow-md"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subtotal & Remove */}
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">Tổng cộng</p>
                                            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => handleRemove(item.id, item.productName)} 
                                            className="group/btn text-red-500 hover:text-white hover:bg-red-500 p-3 rounded-xl transition-all border-2 border-red-200 hover:border-red-500 disabled:opacity-50 shadow-sm hover:shadow-lg"
                                            title="Xóa sản phẩm"
                                            disabled={isLoading}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-4 border-2 border-gray-100">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-4xl">💰</span>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Tổng Cộng
                                </h2>
                            </div>

                            <div className="space-y-5 mb-8">
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                                    <span className="text-gray-700 font-medium">Tạm tính:</span>
                                    <span className="font-bold text-lg text-gray-800">{grandTotal.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                                    <span className="text-gray-700 font-medium">Phí vận chuyển:</span>
                                    <span className="font-bold text-lg text-green-600">Miễn phí 🎉</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                                    <span className="text-gray-700 font-medium">Số lượng:</span>
                                    <span className="font-bold text-lg text-blue-600">{totalItems} sản phẩm</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl mb-8 border-2 border-green-300">
                                <span className="text-xl font-bold text-gray-800">Thành tiền:</span>
                                <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {grandTotal.toLocaleString('vi-VN')}₫
                                </span>
                            </div>
                            
                            <button
                                onClick={handleCheckout}
                                disabled={isLoading || cartItems.length === 0}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 mb-4"
                            >
                                💳 Tiến Hành Thanh Toán
                            </button>
                            
                            <Link 
                                to="/" 
                                className="flex items-center justify-center gap-2 text-green-600 w-full py-4 rounded-2xl font-bold text-lg hover:bg-green-50 border-2 border-green-600 hover:border-green-700 transition-all shadow-md hover:shadow-lg"
                            >
                                <span>🌿</span>
                                <span>Tiếp Tục Mua Sắm</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;