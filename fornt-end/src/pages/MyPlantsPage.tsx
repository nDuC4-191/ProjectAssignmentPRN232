// src/pages/MyPlantsPage.tsx
import React, { useState, useEffect } from 'react';
import { userPlantApi } from '../services/api.service';
import type { UserPlantDTO, UserPlantStatisticsDTO } from '../types/userPlant.types';
import { Link } from 'react-router-dom';

const MyPlantsPage: React.FC = () => {
  const [plants, setPlants] = useState<UserPlantDTO[]>([]);
  const [statistics, setStatistics] = useState<UserPlantStatisticsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plantsData, statsData] = await Promise.all([
        userPlantApi.getAll(),
        userPlantApi.getStatistics()
      ]);
      setPlants(plantsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }
    try {
      const results = await userPlantApi.search(searchTerm);
      setPlants(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleFilterStatus = async (status: string) => {
    setFilterStatus(status);
    if (status === 'all') {
      loadData();
      return;
    }
    try {
      const results = await userPlantApi.getByStatus(status);
      setPlants(results);
    } catch (error) {
      console.error('Error filtering:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa cây này?')) return;
    try {
      await userPlantApi.delete(id);
      alert('Xóa cây thành công');
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Không thể xóa cây');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Đang sống': return 'bg-green-100 text-green-800';
      case 'Chết': return 'bg-red-100 text-red-800';
      case 'Đã tặng / bán': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🌱 Vườn Cây Của Tôi</h1>
        <p className="text-gray-600">Quản lý và chăm sóc cây trồng của bạn</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Tổng số cây</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.totalPlants}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Đang sống</p>
            <p className="text-2xl font-bold text-green-600">{statistics.alivePlants}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Đã chết</p>
            <p className="text-2xl font-bold text-red-600">{statistics.deadPlants}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Cần tưới</p>
            <p className="text-2xl font-bold text-orange-600">{statistics.plantsNeedWatering}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Cần bón phân</p>
            <p className="text-2xl font-bold text-purple-600">{statistics.plantsNeedFertilizing}</p>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm cây..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Tìm
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterStatus('all')}
              className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleFilterStatus('Đang sống')}
              className={`px-4 py-2 rounded-lg ${filterStatus === 'Đang sống' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              Đang sống
            </button>
            <button
              onClick={() => handleFilterStatus('Chết')}
              className={`px-4 py-2 rounded-lg ${filterStatus === 'Chết' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            >
              Chết
            </button>
          </div>
        </div>
      </div>

      {/* Add New Plant Button */}
      <div className="mb-6">
        <Link
          to="/my-plants/add"
          className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          <span className="mr-2">+</span> Thêm Cây Mới
        </Link>
      </div>

      {/* Plants Grid */}
      {plants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Chưa có cây nào. Hãy thêm cây đầu tiên! 🌱</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <div key={plant.userPlantID} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <img
                src={plant.imageUrl || '/placeholder-plant.jpg'}
                alt={plant.productName}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {plant.nickname || plant.productName}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(plant.status)}`}>
                    {plant.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{plant.productName}</p>
                
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div className="text-center">
                    <p className="text-gray-500">Độ khó</p>
                    <p className="font-semibold">{plant.difficulty}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Ánh sáng</p>
                    <p className="font-semibold">{plant.lightRequirement}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Nước</p>
                    <p className="font-semibold">{plant.waterRequirement}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/my-plants/${plant.userPlantID}`}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
                  >
                    Chi tiết
                  </Link>
                  <button
                    onClick={() => handleDelete(plant.userPlantID)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPlantsPage;