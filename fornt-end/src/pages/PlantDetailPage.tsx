// src/pages/PlantDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userPlantApi } from '../services/api.service';
import type { UserPlantDetailDTO } from '../types/userPlant.types';

const PlantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<UserPlantDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadPlantDetail();
  }, [id]);

  const loadPlantDetail = async () => {
    try {
      setLoading(true);
      const data = await userPlantApi.getDetail(Number(id));
      setPlant(data);
      setNewStatus(data.status || 'Đang sống');
    } catch (error) {
      console.error('Error loading plant detail:', error);
      alert('Không thể tải thông tin cây');
    } finally {
      setLoading(false);
    }
  };

  const handleWatering = async () => {
    try {
      await userPlantApi.updateWatering(Number(id), new Date());
      alert('Đã cập nhật lịch tưới nước ✅');
      loadPlantDetail();
    } catch (error) {
      console.error('Error updating watering:', error);
      alert('Không thể cập nhật');
    }
  };

  const handleFertilizing = async () => {
    try {
      await userPlantApi.updateFertilizing(Number(id), new Date());
      alert('Đã cập nhật lịch bón phân ✅');
      loadPlantDetail();
    } catch (error) {
      console.error('Error updating fertilizing:', error);
      alert('Không thể cập nhật');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await userPlantApi.updateStatus(Number(id), newStatus);
      alert('Đã cập nhật trạng thái ✅');
      setShowUpdateStatus(false);
      loadPlantDetail();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Không thể cập nhật');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Không tìm thấy cây</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/my-plants')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
      >
        ← Quay lại danh sách
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="relative">
          <img
            src={plant.product.imageUrl || '/placeholder-plant.jpg'}
            alt={plant.product.productName}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowUpdateStatus(true)}
              className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md"
            >
              {plant.status}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Plant Info */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {plant.nickname || plant.product.productName}
            </h1>
            <p className="text-gray-600">{plant.product.productName}</p>
          </div>

          {/* Care Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Đã trồng</p>
              <p className="text-2xl font-bold text-blue-600">{plant.daysSincePlanted} ngày</p>
              <p className="text-xs text-gray-500 mt-1">
                {plant.plantedDate ? new Date(plant.plantedDate).toLocaleDateString('vi-VN') : 'Chưa rõ'}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Tưới lần cuối</p>
              <p className="text-2xl font-bold text-green-600">{plant.daysSinceWatered} ngày trước</p>
              <button
                onClick={handleWatering}
                className="mt-2 w-full px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                💧 Đã tưới hôm nay
              </button>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Bón phân lần cuối</p>
              <p className="text-2xl font-bold text-purple-600">{plant.daysSinceFertilized} ngày trước</p>
              <button
                onClick={handleFertilizing}
                className="mt-2 w-full px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
              >
                🌿 Đã bón phân
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cây</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-600 text-sm">Độ khó</p>
                <p className="font-semibold">{plant.product.difficulty}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-600 text-sm">Ánh sáng</p>
                <p className="font-semibold">{plant.product.lightRequirement}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-600 text-sm">Nước</p>
                <p className="font-semibold">{plant.product.waterRequirement}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-600 text-sm">Loại đất</p>
                <p className="font-semibold text-xs">{plant.product.soilType || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {plant.product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Mô tả</h2>
              <p className="text-gray-700 leading-relaxed">{plant.product.description}</p>
            </div>
          )}

          {/* Notes */}
          {plant.notes && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Ghi chú</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-gray-700">{plant.notes}</p>
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          {plant.upcomingReminders.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Lịch nhắc sắp tới</h2>
              <div className="space-y-2">
                {plant.upcomingReminders.map((reminder) => (
                  <div key={reminder.reminderID} className="bg-orange-50 border-l-4 border-orange-400 p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{reminder.reminderType}</p>
                        <p className="text-sm text-gray-600">{reminder.message}</p>
                      </div>
                      <p className="text-sm text-orange-600 font-semibold">
                        {new Date(reminder.reminderDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Cập nhật trạng thái</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-green-500"
            >
              <option value="Đang sống">Đang sống</option>
              <option value="Chết">Chết</option>
              <option value="Đã tặng / bán">Đã tặng / bán</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowUpdateStatus(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetailPage;