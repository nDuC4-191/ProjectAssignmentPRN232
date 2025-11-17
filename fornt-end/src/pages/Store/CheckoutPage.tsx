import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateOrderDTO, ShippingAddress } from '../../types/order.types';
import { orderService } from '../../services/order.service';

const CheckoutPage: React.FC = () => {
    const { cartItems, clearCart, refreshCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);
    
    const [shippingInfo, setShippingInfo] = useState<ShippingAddress>({
        fullName: '',
        phoneNumber: '',
        addressLine: '',
        city: 'Hanoi',
        country: 'Vietnam'
    });
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY" | "MOMO">("COD");
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        if (user) {
            setShippingInfo(prev => ({
                ...prev,
                fullName: user.fullName || '',
                phoneNumber: user.phone || '',
                addressLine: user.address || ''
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setShippingInfo(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!cartItems || cartItems.length === 0) {
            alert('Giỏ hàng trống');
            return;
        }
        
        if (!shippingInfo.fullName.trim()) {
            alert('Vui lòng nhập họ tên');
            return;
        }
        if (!shippingInfo.phoneNumber.trim()) {
            alert('Vui lòng nhập số điện thoại');
            return;
        }
        if (!shippingInfo.addressLine.trim()) {
            alert('Vui lòng nhập địa chỉ');
            return;
        }
        
        setLoading(true);
        
        const orderData: CreateOrderDTO = {
            shippingAddress: {
                fullName: shippingInfo.fullName.trim(),
                phoneNumber: shippingInfo.phoneNumber.trim(),
                addressLine: shippingInfo.addressLine.trim(),
                city: shippingInfo.city || 'Hanoi',
                country: shippingInfo.country || 'Vietnam'
            },
            paymentMethod: paymentMethod,
            notes: notes.trim() || undefined
        };
try {
            // ✅ SỬA LOGIC TRONG KHỐI NÀY
            const response = await orderService.checkout(orderData);
            const orderResponse = response as any;
            
            // === LOGIC MỚI: PHÂN LUỒNG THANH TOÁN ===

            // TRƯỜNG HỢP 1: VNPAY (Backend trả về paymentUrl)
            if (orderResponse.paymentUrl) {
                await clearCart();
                // Chuyển hướng người dùng đến cổng VNPay
                window.location.href = orderResponse.paymentUrl;
            } 
            // TRƯỜNG HỢP 2: COD (Backend trả về data.orderId)
            else {
                // Đây là logic cũ của bạn để lấy orderId, rất tốt
                const orderId = orderResponse?.data?.orderId || orderResponse?.orderId || orderResponse?.data?.id || orderResponse?.id;
                await clearCart();
                if (orderId) {
                    navigate(`/order-success/${orderId}`);

                } else {
                    // Fallback nếu không tìm thấy orderId
                    alert('Đặt hàng thành công!');
                    navigate('/orders');
                }
            }
        } catch (error: any) {
            // (Phần catch của bạn đã đúng, giữ nguyên)
            console.error('Lỗi khi thanh toán:', error);
            const errorData = error.response?.data;
            let errorMessage = 'Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.';
            if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (errorData?.errors) {
                const errors = Object.values(errorData.errors).flat();
                errorMessage = errors.join('\n');
             }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    //     try {
    //         const response = await orderService.checkout(orderData);
            
    //         const orderResponse = response as any;
    //         const orderId = orderResponse?.data?.orderId || 
    //                        orderResponse?.orderId || 
    //                        orderResponse?.data?.id || 
    //                        orderResponse?.id;
            
    //         await clearCart();
            
    //         if (orderId) {
    //             navigate(`/order-success/${orderId}`);
    //         } else {
    //             alert('Đặt hàng thành công!');
    //             navigate('/orders');
    //         }
    //     } catch (error: any) {
    //         console.error('Lỗi khi thanh toán:', error);
            
    //         const errorData = error.response?.data;
    //         let errorMessage = 'Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.';
            
    //         if (errorData?.message) {
    //             errorMessage = errorData.message;
    //         } else if (errorData?.errors) {
    //             const errors = Object.values(errorData.errors).flat();
    //             errorMessage = errors.join('\n');
    //         }
            
    //         alert(errorMessage);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center py-20 px-6">
                    <div className="text-9xl mb-8 animate-bounce">🛒</div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
                        Giỏ Hàng Trống
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
                        Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                        <span className="text-2xl">🌿</span>
                        <span>Tiếp Tục Mua Sắm</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <span className="text-7xl">💳</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                        Thanh Toán Đơn Hàng
                    </h1>
                    <p className="text-lg text-gray-600">
                        Bạn đang thanh toán <span className="font-bold text-blue-600">{totalItems}</span> sản phẩm
                    </p>
                </div>

                {/* Loading overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center">
                            <div className="relative inline-block">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                                <span className="absolute inset-0 flex items-center justify-center text-2xl">💳</span>
                            </div>
                            <p className="mt-6 text-gray-700 font-semibold text-lg">Đang xử lý đơn hàng...</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Shipping Info & Payment */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Shipping Information */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-4xl">📦</span>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Thông Tin Giao Hàng
                                </h2>
                            </div>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        👤 Họ và Tên <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        name="fullName" 
                                        value={shippingInfo.fullName} 
                                        onChange={handleChange} 
                                        placeholder="Nhập họ và tên đầy đủ" 
                                        className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg" 
                                        required 
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        📱 Số Điện Thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        name="phoneNumber" 
                                        value={shippingInfo.phoneNumber} 
                                        onChange={handleChange} 
                                        placeholder="Nhập số điện thoại liên hệ" 
                                        className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg" 
                                        required 
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        🏠 Địa Chỉ Giao Hàng <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        name="addressLine" 
                                        value={shippingInfo.addressLine} 
                                        onChange={handleChange} 
                                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện" 
                                        className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg" 
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        📝 Ghi Chú Đơn Hàng (Tùy chọn)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Ví dụ: Giao giờ hành chính, để trước cửa, gọi trước khi giao..."
                                        className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-4xl">💰</span>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Phương Thức Thanh Toán
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                <label className={`flex items-center gap-4 p-5 rounded-2xl border-3 cursor-pointer transition-all ${
                                    paymentMethod === 'COD' 
                                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg' 
                                        : 'border-gray-300 hover:border-green-300 hover:shadow-md'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={(e) => setPaymentMethod(e.target.value as "COD" | "VNPAY" | "MOMO")}
                                        className="w-5 h-5 text-green-600 focus:ring-green-500"
                                    />
                                    <div className="flex-grow">
                                        <p className="font-bold text-lg text-gray-800">💵 Thanh toán khi nhận hàng (COD)</p>
                                        <p className="text-sm text-gray-600 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                    </div>
                                    {paymentMethod === 'COD' && (
                                        <span className="text-green-600 font-bold text-xl">✓</span>
                                    )}
                                </label>

                                <label className="flex items-center gap-4 p-5 rounded-2xl border-3 border-gray-300 bg-gray-50 cursor-not-allowed opacity-60">
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="VNPAY"
                                        disabled
                                        className="w-5 h-5"
                                    />
                                    <div className="flex-grow">
                                        <p className="font-bold text-lg text-gray-800">🏦 Ví VNPAY</p>
                                        <p className="text-sm text-gray-600 mt-1">Chưa hỗ trợ</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 p-5 rounded-2xl border-3 border-gray-300 bg-gray-50 cursor-not-allowed opacity-60">
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="MOMO"
                                        disabled
                                        className="w-5 h-5"
                                    />
                                    <div className="flex-grow">
                                        <p className="font-bold text-lg text-gray-800">📱 Ví MoMo</p>
                                        <p className="text-sm text-gray-600 mt-1">Chưa hỗ trợ</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-4 border-2 border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-4xl">📋</span>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Đơn Hàng
                                </h2>
                            </div>

                            {/* Cart Items */}
                            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
                                        <img 
                                            src={item.imageUrl || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100'} 
                                            alt={item.productName}
                                            className="w-16 h-16 rounded-xl object-cover shadow-md"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100';
                                            }}
                                        />
                                        <div className="flex-grow min-w-0">
                                            <p className="font-bold text-gray-800 line-clamp-2 text-sm">{item.productName}</p>
                                            <p className="text-xs text-gray-600 mt-1">SL: {item.quantity}</p>
                                            <p className="font-bold text-green-600 mt-1 text-sm">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Summary */}
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                                    <span className="text-gray-700 font-medium">Tạm tính:</span>
                                    <span className="font-bold text-lg">{grandTotal.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                                    <span className="text-gray-700 font-medium">Phí vận chuyển:</span>
                                    <span className="font-bold text-lg text-green-600">Miễn phí 🎉</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl mb-6 border-2 border-blue-300">
                                <span className="text-xl font-bold text-gray-800">Tổng cộng:</span>
                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    {grandTotal.toLocaleString('vi-VN')}₫
                                </span>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            >
                                {loading ? "⏳ Đang xử lý..." : "🎉 Đặt Hàng Ngay"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;