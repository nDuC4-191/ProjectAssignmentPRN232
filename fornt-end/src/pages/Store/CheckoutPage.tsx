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

    // Load cart khi vào trang
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
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [notes, setNotes] = useState(''); // ✅ Ghi chú đơn hàng
    const [loading, setLoading] = useState(false);

    // Tính tổng tiền
    const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Tự động điền thông tin từ user nếu đăng nhập
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
        
        // Validate
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
            notes: notes.trim() || undefined // ✅ Gửi nếu có nội dung, không thì undefined
        };

        try {
            console.log('📦 Cart items:', cartItems);
            console.log('📦 Sending order data:', JSON.stringify(orderData, null, 2));
            
            const response = await orderService.checkout(orderData);
            console.log('✅ Order response:', response);
            
            const orderResponse = response as any;
            const orderId = orderResponse?.data?.orderId || 
                           orderResponse?.orderId || 
                           orderResponse?.data?.id || 
                           orderResponse?.id;
            
            await clearCart();
            
            if (orderId) {
                navigate(`/order-success/${orderId}`);
            } else {
                alert('Đặt hàng thành công!');
                navigate('/orders');
            }
        } catch (error: any) {
            console.error('❌ Lỗi khi thanh toán:', error);
            console.error('❌ Error response:', JSON.stringify(error.response?.data, null, 2));
            
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

    // Giỏ hàng trống
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">Giỏ hàng</div>
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
                {/* === THÔNG TIN GIAO HÀNG === */}
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

                        {/* === GHI CHÚ ĐƠN HÀNG === */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ghi chú đơn hàng (tùy chọn)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ví dụ: Giao giờ hành chính, để trước cửa, gọi trước khi giao..."
                                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                rows={3}
                            />
                        </div>
                    </div>
                    
                    {/* === PHƯƠNG THỨC THANH TOÁN === */}
                    <h2 className="text-2xl font-semibold mb-4 mt-8">Phương thức thanh toán</h2>
                    <select 
                        value={paymentMethod} 
                        onChange={(e) => setPaymentMethod(e.target.value)} 
                        className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                        <option value="VNPAY" disabled>Ví VNPAY (Chưa hỗ trợ)</option>
                    </select>
                </div>
                
                {/* === TÓM TẮT ĐƠN HÀNG === */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-2xl font-semibold mb-4">Đơn hàng của bạn</h2>
                    <div className="space-y-2">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center border-b py-3">
                                <div className="flex items-center gap-3 flex-grow">
                                    {(item.imageUrl || item.plantImage) && (
                                        <img 
                                            src={item.imageUrl || item.plantImage} 
                                            alt={item.productName || item.plantName}
                                            className="w-12 h-12 rounded object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/placeholder.png';
                                            }}
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">{item.productName || item.plantName}</p>
                                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                    </div>
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
                            <span className="text-green-600 font-medium">Miễn phí</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t-2 border-gray-300">
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