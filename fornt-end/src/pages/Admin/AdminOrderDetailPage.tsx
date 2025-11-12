// src/pages/Admin/AdminOrderDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { orderApi } from "../../services/orderApi.service";
import type { OrderDetailDTO, OrderStatus } from "../../types/order.types";
import { ORDER_STATUSES } from "../../types/order.types";

const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await orderApi.getOrderById(parseInt(id));
      setOrder(data);
      setSelectedStatus(data.status as OrderStatus || "");
      setError("");
    } catch (err: any) {
      setError("Không thể tải chi tiết đơn hàng.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!id || !selectedStatus) return;
    
    setUpdating(true);
    try {
      await orderApi.updateOrderStatus(parseInt(id), { status: selectedStatus });
      alert("✅ Cập nhật trạng thái thành công!");
      setShowStatusModal(false);
      fetchOrderDetail();
    } catch (err: any) {
      console.error(err);
      alert("❌ Có lỗi khi cập nhật trạng thái!");
    } finally {
      setUpdating(false);
    }
  };

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

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "0 ₫";
    return amount.toLocaleString("vi-VN") + " ₫";
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Processing": return "bg-blue-100 text-blue-800 border-blue-300";
      case "Shipping": return "bg-purple-100 text-purple-800 border-purple-300";
      case "Delivered": return "bg-green-100 text-green-800 border-green-300";
      case "Completed": return "bg-green-200 text-green-900 border-green-400";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

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

  if (loading) {
    return <div className="p-8 text-center">Đang tải...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || "Không tìm thấy đơn hàng"}
        </div>
        <button
          onClick={() => navigate("/admin/orders")}
          className="mt-4 text-green-600 hover:text-green-800"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/orders"
          className="text-green-600 hover:text-green-800 mb-4 inline-block"
        >
          ← Quay lại danh sách
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Đơn hàng #{order.orderId}
          </h1>
          <button
            onClick={() => setShowStatusModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            🔄 Cập nhật trạng thái
          </button>
        </div>
      </div>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            👤 Thông tin khách hàng
          </h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-500">Tên:</span>{" "}
              <span className="font-medium">{order.userName}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Email:</span>{" "}
              <span className="font-medium">{order.userEmail}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">SĐT:</span>{" "}
              <span className="font-medium">{order.userPhone || "N/A"}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Địa chỉ:</span>{" "}
              <span className="font-medium">{order.address || "N/A"}</span>
            </p>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Trạng thái đơn hàng
          </h2>
          <div className="space-y-3">
            <div
              className={`px-4 py-3 rounded-lg border-2 text-center font-semibold ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </div>
            <p className="text-sm text-gray-500">
              Tạo: {formatDate(order.createdAt)}
            </p>
            <p className="text-sm text-gray-500">
              Cập nhật: {formatDate(order.updatedAt)}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            💳 Thanh toán
          </h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-500">Phương thức:</span>{" "}
              <span className="font-medium">{order.paymentMethod || "N/A"}</span>
            </p>
            <p className="text-2xl font-bold text-green-600 mt-4">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-800">📦 Sản phẩm</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Đơn giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.orderItems.map((item) => (
                <tr key={item.orderDetailId}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                      )}
                      <span className="font-medium text-gray-900">
                        {item.productName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-6 py-4 text-gray-700">x{item.quantity}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-6 py-4 text-right font-semibold">
                  Tổng cộng:
                </td>
                <td className="px-6 py-4 font-bold text-xl text-green-600">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Cập nhật trạng thái</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn trạng thái mới
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={updating}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {updating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetailPage;