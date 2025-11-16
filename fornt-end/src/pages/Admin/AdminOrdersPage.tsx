// src/pages/Admin/AdminOrdersPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../services/orderApi.service";
import type { OrderListDTO, OrderStatisticsDTO } from "../../types/order.types";
import { ORDER_STATUSES } from "../../types/order.types";

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderListDTO[]>([]);
  const [statistics, setStatistics] = useState<OrderStatisticsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await orderApi.getStatistics();
      setStatistics(stats);
    } catch (err: any) {
      console.error("Error fetching statistics:", err);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getOrders(
        statusFilter || undefined, 
        searchTerm || undefined
      );
      setOrders(data);
      setError("");
    } catch (err: any) {
      setError("Không thể tải danh sách đơn hàng.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchOrders();
  }, [statusFilter, searchTerm]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "0 ₫";
    return amount.toLocaleString("vi-VN") + " ₫";
  };

  // Get status badge color
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipping":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-green-200 text-green-900";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text in Vietnamese
  const getStatusText = (status: string | null) => {
    switch (status) {
      case "Pending": return "Chờ xác nhận";
      case "Processing": return "Đang xử lý";
      case "Shipping": return "Đang giao";
      case "Delivered": return "Đã giao";
      case "Completed": return "Hoàn thành";
      case "Cancelled": return "Đã hủy";
      default: return status || "N/A";
    }
  };

  if (loading && !statistics) {
    return <p className="p-6">Đang tải dữ liệu...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">📦 Quản lý đơn hàng</h1>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
            <p className="text-3xl font-bold text-gray-800">{statistics.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(statistics.totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Đang xử lý</p>
            <p className="text-3xl font-bold text-blue-600">{statistics.processingOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Hoàn thành</p>
            <p className="text-3xl font-bold text-green-600">{statistics.completedOrders}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên khách hàng, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tất cả trạng thái</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {getStatusText(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        #{order.orderId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.userName}
                      </div>
                      <div className="text-sm text-gray-500">{order.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{order.totalItems} món</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/admin/orders/${order.orderId}`}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Chi tiết →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;