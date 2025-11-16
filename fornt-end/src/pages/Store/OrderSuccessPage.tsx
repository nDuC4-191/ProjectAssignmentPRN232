import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import type { OrderStatus } from '../../types/order.types';

const OrderSuccessPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<OrderStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            if (orderId) {
                try {
                    setLoading(true);
                    const statusData = await orderService.getOrderStatus(parseInt(orderId));
                    setStatus(statusData);
                } catch (error) {
                    console.error("Lỗi tải trạng thái:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchStatus();
    }, [orderId]);

    const getStatusColor = (currentStatus?: string) => {
        switch (currentStatus) {
            case 'Pending':
                return 'from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300';
            case 'Confirmed':
                return 'from-blue-100 to-cyan-100 text-blue-800 border-blue-300';
            case 'Shipping':
                return 'from-purple-100 to-pink-100 text-purple-800 border-purple-300';
            case 'Delivered':
                return 'from-green-100 to-emerald-100 text-green-800 border-green-300';
            case 'Cancelled':
                return 'from-red-100 to-rose-100 text-red-800 border-red-300';
            default:
                return 'from-gray-100 to-slate-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (currentStatus?: string) => {
        switch (currentStatus) {
            case 'Pending': return '⏳';
            case 'Confirmed': return '✅';
            case 'Shipping': return '🚚';
            case 'Delivered': return '📦';
            case 'Cancelled': return '❌';
            default: return '📋';
        }
    };

    const getStatusText = (currentStatus?: string) => {
        switch (currentStatus) {
            case 'Pending': return 'Đang chờ xác nhận';
            case 'Confirmed': return 'Đã xác nhận';
            case 'Shipping': return 'Đang giao hàng';
            case 'Delivered': return 'Đã giao hàng';
            case 'Cancelled': return 'Đã hủy';
            default: return currentStatus || 'Không rõ';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 border-t-green-600"></div>
                        <span className="absolute inset-0 flex items-center justify-center text-3xl">📦</span>
                    </div>
                    <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Animation */}
                <div className="text-center mb-8 animate-bounce">
                    <div className="inline-block">
                        <div className="relative">
                            <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                                <span className="text-6xl">✓</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                    </div>
                </div>

                {/* Success Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-gray-100 text-center">
                    {/* Header */}
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                        Đặt Hàng Thành Công! 🎉
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Cảm ơn bạn đã tin tưởng và mua hàng tại cửa hàng chúng tôi
                    </p>

                    {/* Order ID */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border-2 border-blue-200">
                        <p className="text-sm text-gray-600 mb-2 font-medium">Mã đơn hàng của bạn</p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-3xl">🎫</span>
                            <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                #{orderId}
                            </span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    {status && (
                        <div className="mb-8">
                            <p className="text-sm text-gray-600 mb-3 font-medium">Trạng thái đơn hàng</p>
                            <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl border-2 bg-gradient-to-r ${getStatusColor(status.currentStatus)} shadow-lg`}>
                                <span className="text-3xl">{getStatusIcon(status.currentStatus)}</span>
                                <span className="text-xl font-bold">{getStatusText(status.currentStatus)}</span>
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border-2 border-yellow-200 text-left">
                        <div className="flex items-start gap-4">
                            <span className="text-3xl flex-shrink-0">📬</span>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Bước tiếp theo</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">•</span>
                                        <span>Chúng tôi sẽ xác nhận đơn hàng trong vòng 24 giờ</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">•</span>
                                        <span>Bạn sẽ nhận được thông báo qua email và SMS</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">•</span>
                                        <span>Theo dõi đơn hàng tại mục "Đơn hàng của tôi"</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link 
                            to="/orders"
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                        >
                            <span className="text-xl">📋</span>
                            <span>Xem Đơn Hàng</span>
                        </Link>
                        <Link 
                            to="/"
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                        >
                            <span className="text-xl">🌿</span>
                            <span>Tiếp Tục Mua Sắm</span>
                        </Link>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        Cần hỗ trợ? 
                        <button 
                            onClick={() => navigate('/contact')}
                            className="text-green-600 font-semibold hover:text-green-700 ml-1 underline"
                        >
                            Liên hệ với chúng tôi
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;