// src/pages/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/order.service';
import type { OrderSummaryDTO } from '../../types/order.types';
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
        const data = await orderService.getMyOrders();
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

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'Pending': 
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          text: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳'
        };
      case 'Processing': 
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '⚙️'
        };
      case 'Shipping': 
        return {
          bg: 'bg-gradient-to-r from-purple-50 to-pink-50',
          text: 'text-purple-700',
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '🚚'
        };
      case 'Delivered': 
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800 border-green-200',
          icon: '📦'
        };
      case 'Completed': 
        return {
          bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: '✅'
        };
      case 'Cancelled': 
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌'
        };
      default: 
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '📋'
        };
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'Pending': return 'Chờ xử lý';
      case 'Processing': return 'Đang xử lý';
      case 'Shipping': return 'Đang giao';
      case 'Delivered': return 'Đã giao';
      case 'Completed': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status || 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Loading Header */}
            <div className="mb-8 animate-pulse">
              <div className="h-10 bg-gray-200 rounded-lg w-64 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded-lg w-96"></div>
            </div>

            {/* Loading Cards */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded-lg w-40 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-56"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Đơn hàng của tôi
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Theo dõi và quản lý các đơn hàng bạn đã đặt
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">Chưa có đơn hàng nào</h3>
              <p className="text-gray-600 mb-8 text-lg">Hãy bắt đầu mua sắm và chăm sóc vườn cây của bạn ngay hôm nay!</p>
              <Link 
                to="/" 
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <div 
                    key={order.orderId} 
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                  >
                    {/* Status Bar */}
                    <div className={`h-2 ${statusStyle.bg}`}></div>
                    
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">
                                Đơn hàng #{order.orderId}
                              </h3>
                              {order.status && (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.badge} mt-1`}>
                                  <span>{statusStyle.icon}</span>
                                  {getStatusText(order.status)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 ml-15">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">{formatDate(order.orderDate)}</span>
                          </div>
                        </div>

                        {/* Total Amount */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {order.totalAmount.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100 my-4"></div>

                      {/* Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Chi tiết giao hàng và sản phẩm có thể xem ở trang chi tiết đơn hàng</span>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end">
                        <Link
                          to={`/order-success/${order.orderId}`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all group/btn"
                        >
                          <span>Xem chi tiết</span>
                          <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;