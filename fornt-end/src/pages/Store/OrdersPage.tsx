// src/pages/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/order.service';
import type { OrderSummaryDTO } from '../../types/order.types'; // ← DÙNG DTO NHỎ
import { Link, useNavigate } from 'react-router-dom';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getMyOrders(); // ← DÙNG /history
        setOrders(data);
      } catch (err: any) {
        console.error('Lỗi tải đơn hàng:', err);
        setError(err.response?.data?.message || 'Không thể tải đơn hàng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipping': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">Warning</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Đơn hàng của tôi</h1>
        <p className="text-gray-600">Theo dõi và quản lý các đơn hàng bạn đã đặt</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">Package</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-600 mb-6">Hãy bắt đầu mua sắm ngay hôm nay!</p>
          <Link to="/" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.orderId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">Đơn hàng #{order.orderId}</h3>
                    {order.status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status === 'Pending' ? 'Chờ xử lý' :
                         order.status === 'Processing' ? 'Đang xử lý' :
                         order.status === 'Shipping' ? 'Đang giao' :
                         order.status === 'Delivered' ? 'Đã giao' :
                         order.status === 'Completed' ? 'Hoàn thành' :
                         order.status === 'Cancelled' ? 'Đã hủy' : order.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Ngày đặt: {formatDate(order.orderDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">{order.totalAmount.toLocaleString('vi-VN')}₫</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  Chi tiết giao hàng và sản phẩm: Xem ở trang chi tiết
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  to={`/order-success/${order.orderId}`}
                  className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                >
                  Xem chi tiết
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;