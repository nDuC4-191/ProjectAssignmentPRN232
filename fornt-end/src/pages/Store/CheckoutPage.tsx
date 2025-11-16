import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateOrderDTO, ShippingAddress } from '../../types/order.types';
import { orderService } from '../../services/order.service';

const CheckoutPage: React.FC = () => {
    // ✅ Thêm refreshCart
    const { cartItems, clearCart, refreshCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // ✅ Load cart khi vào trang
    useEffect(() => {
        refreshCart();
    }, []);
    
    const [shippingInfo, setShippingInfo] = useState<ShippingAddress>({
        fullName: '',
        phoneNumber: '',
        addressLine: '',
        city: 'Hanoi',
        country: 'Vietnam'
    });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);

    // ✅ Tính tổng tiền từ cartItems
    const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
        
        // ✅ Sửa: Check cartItems thay vì cart
        if (!cartItems || cartItems.length === 0) {
            alert('Giỏ hàng trống');
            return;
        }
        
        setLoading(true);
        const orderData: CreateOrderDTO = {
            shippingAddress: shippingInfo,
            paymentMethod: paymentMethod,
        };

        try {
            const response = await orderService.checkout(orderData);
            console.log('✅ Order response:', response); // Debug
            
            // ✅ Cast type để tránh lỗi TypeScript
            const orderResponse = response as any;
            
            // ✅ Xử lý nhiều dạng response structure
            const orderId = orderResponse?.orderId || 
                           orderResponse?.data?.orderId || 
                           orderResponse?.id || 
                           orderResponse?.data?.id;
            
            // ✅ Xóa giỏ hàng
            await clearCart();
            
            // Navigate đến trang success
            if (orderId) {
                navigate(`/order-success/${orderId}`);
            } else {
                // Fallback: Navigate về trang orders nếu không có orderId
                alert('Đặt hàng thành công!');
                navigate('/orders');
            }
        } catch (error: any) {
            console.error('❌ Lỗi khi thanh toán:', error);
            alert(error.response?.data?.message || 'Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Kiểm tra giỏ hàng trống
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">🛒</div>
                <h1 className="text-3xl font-bold mb-4">Giỏ hàng trống</h1>
                <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                    Tiếp tục mua sắm
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Thông tin giao hàng</h2>
                    <div className="space-y-4">
                        <input 
                            name="fullName" 
                            value={shippingInfo.fullName} 
                            onChange={handleChange} 
                            placeholder="Họ và tên" 
                            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                            required 
                        />
                        <input 
                            name="phoneNumber" 
                            value={shippingInfo.phoneNumber} 
                            onChange={handleChange} 
                            placeholder="Số điện thoại" 
                            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                            required 
                        />
                        <input 
                            name="addressLine" 
                            value={shippingInfo.addressLine} 
                            onChange={handleChange} 
                            placeholder="Địa chỉ (Số nhà, Đường, Phường/Xã)" 
                            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                            required 
                        />
                    </div>
                    
                    <h2 className="text-2xl font-semibold mb-4 mt-8">Phương thức thanh toán</h2>
                    <select 
                        name="paymentMethod" 
                        value={paymentMethod} 
                        onChange={(e) => setPaymentMethod(e.target.value)} 
                        className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                        <option value="VNPAY" disabled>Ví VNPAY (Chưa hỗ trợ)</option>
                    </select>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-2xl font-semibold mb-4">Đơn hàng của bạn</h2>
                    <div className="space-y-2">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center border-b py-3">
                                <div className="flex-grow">
                                    <p className="font-medium">{item.plantName}</p>
                                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                </div>
                                <span className="font-semibold">
                                    {(item.price * item.quantity).toLocaleString()} VND
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-300">
                        <div className="flex justify-between text-gray-600 mb-2">
                            <span>Tạm tính:</span>
                            <span>{grandTotal.toLocaleString()} VND</span>
                        </div>
                        <div className="flex justify-between text-gray-600 mb-2">
                            <span>Phí vận chuyển:</span>
                            <span>Miễn phí</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t border-gray-300">
                        <span>Tổng cộng:</span>
                        <span className="text-green-600">{grandTotal.toLocaleString()} VND</span>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="bg-green-600 text-white text-center w-full block py-3 rounded-md font-semibold hover:bg-green-700 mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Đang xử lý..." : "Đặt Hàng"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;