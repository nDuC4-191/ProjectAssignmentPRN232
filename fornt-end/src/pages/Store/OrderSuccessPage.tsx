import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/order.service';
// Sửa import (dùng 'type')
import type { OrderStatus } from '../../types/order.types';

const OrderSuccessPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [status, setStatus] = useState<OrderStatus | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            if (orderId) {
                try {
                    // SỬA Ở ĐÂY:
                    const statusData = await orderService.getOrderStatus(parseInt(orderId));
                    setStatus(statusData);
                } catch (error) {
                    console.error("Lỗi tải trạng thái:", error);
                }
            }
        };
        fetchStatus();
    }, [orderId]);

    return (
        <div className="text-center p-10">
            <h1 className="text-3xl font-bold text-green-700 mb-4">Đặt hàng thành công!</h1>
            <p>Cảm ơn bạn đã mua hàng.</p>
            <p>Mã đơn hàng của bạn là: <strong className="text-lg">#{orderId}</strong></p>
            
            {status && (
                <p className="mt-2">Trạng thái hiện tại: <span className="font-semibold">{status.currentStatus}</span></p>
            )}

            <Link to="/" className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 mt-8 inline-block">
                Tiếp tục mua sắm
            </Link>
        </div>
    );
};
export default OrderSuccessPage;