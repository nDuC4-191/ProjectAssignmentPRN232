import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
// Sửa import (dùng 'type')
import type { CreateOrderDTO, ShippingAddress } from '../../types/order.types';
import { orderService } from '../../services/order.service';

const CheckoutPage: React.FC = () => {
    const { cart, fetchCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [shippingInfo, setShippingInfo] = useState<ShippingAddress>({
        fullName: '',
        phoneNumber: '',
        addressLine: '',
        city: 'Hanoi',
        country: 'Vietnam'
    });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);

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
        if (!cart || cart.items.length === 0) return alert('Giỏ hàng trống');
        
        setLoading(true);
        const orderData: CreateOrderDTO = {
            shippingAddress: shippingInfo,
            paymentMethod: paymentMethod,
        };

        try {
            // SỬA Ở ĐÂY:
            const newOrder = await orderService.checkout(orderData);
            await fetchCart(); // Xóa giỏ hàng ở client
            navigate(`/order-success/${newOrder.orderId}`); // Không có .data
        } catch (error) {
            console.error('Lỗi khi thanh toán:', error);
            alert('Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <h2 className="text-2xl font-semibold mb-4">Thông tin giao hàng</h2>
                <div className="space-y-4">
                    <input name="fullName" value={shippingInfo.fullName} onChange={handleChange} placeholder="Họ và tên" className="w-full border p-2 rounded-md" required />
                    <input name="phoneNumber" value={shippingInfo.phoneNumber} onChange={handleChange} placeholder="Số điện thoại" className="w-full border p-2 rounded-md" required />
                    <input name="addressLine" value={shippingInfo.addressLine} onChange={handleChange} placeholder="Địa chỉ (Số nhà, Đường, Phường/Xã)" className="w-full border p-2 rounded-md" required />
                </div>
                
                <h2 className="text-2xl font-semibold mb-4 mt-8">Phương thức thanh toán</h2>
                <select name="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border p-2 rounded-md">
                    <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                    <option value="VNPAY" disabled>Ví VNPAY (Chưa hỗ trợ)</option>
                </select>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm h-fit">
                <h2 className="text-2xl font-semibold mb-4">Đơn hàng của bạn</h2>
                {cart?.items.map(item => (
                    <div key={item.productId} className="flex justify-between items-center border-b py-2">
                        <span className="text-sm">{item.productName} x {item.quantity}</span>
                        <span className="text-sm font-medium">{item.totalPrice.toLocaleString()} VND</span>
                    </div>
                ))}
                <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
                    <span>Tổng cộng:</span>
                    <span>{cart?.grandTotal.toLocaleString()} VND</span>
                </div>
                <button type="submit" disabled={loading} className="bg-green-600 text-white text-center w-full block py-3 rounded-md font-semibold hover:bg-green-700 mt-6 disabled:bg-gray-400">
                    {loading ? "Đang xử lý..." : "Đặt Hàng"}
                </button>
            </div>
        </form>
    );
};
export default CheckoutPage;