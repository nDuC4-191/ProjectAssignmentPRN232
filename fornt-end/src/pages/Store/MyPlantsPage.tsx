// src/pages/MyPlantsPage.tsx
import React, { useState, useEffect } from 'react';
import { userPlantApi } from "../../services/api.service";
import type { UserPlantDTO, UserPlantStatisticsDTO } from "../../types/userPlant.types";
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
      case 'Đang sống': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'Chết': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
      case 'Đã tặng / bán': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
      default: return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Đang sống': return '🌿';
      case 'Chết': return '💀';
      case 'Đã tặng / bán': return '📦';
      default: return '🌱';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 border-t-green-600"></div>
          <span className="absolute inset-0 flex items-center justify-center text-3xl">🌱</span>
        </div>
        <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải vườn cây của bạn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-7xl">🪴</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Vườn Cây Của Tôi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quản lý và chăm sóc từng cây trồng một cách tận tâm 💚
          </p>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-12">
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 border-2 border-transparent hover:border-blue-200 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm font-medium">Tổng số cây</p>
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {statistics.totalPlants}
              </p>
            </div>
            
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 border-2 border-transparent hover:border-green-200 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm font-medium">Đang sống</p>
                <span className="text-3xl">🌿</span>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {statistics.alivePlants}
              </p>
            </div>
            
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 border-2 border-transparent hover:border-red-200 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm font-medium">Đã chết</p>
                <span className="text-3xl">💀</span>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                {statistics.deadPlants}
              </p>
            </div>
            
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 border-2 border-transparent hover:border-orange-200 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm font-medium">Cần tưới</p>
                <span className="text-3xl">💧</span>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {statistics.plantsNeedWatering}
              </p>
            </div>
            
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 border-2 border-transparent hover:border-purple-200 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm font-medium">Cần bón phân</p>
                <span className="text-3xl">🌾</span>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {statistics.plantsNeedFertilizing}
              </p>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1 flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm cây trồng của bạn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Tìm kiếm
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterStatus('all')}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg ${
                  filterStatus === 'all' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white scale-105' 
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                📚 Tất cả
              </button>
              <button
                onClick={() => handleFilterStatus('Đang sống')}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg ${
                  filterStatus === 'Đang sống' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white scale-105' 
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300'
                }`}
              >
                🌿 Đang sống
              </button>
              <button
                onClick={() => handleFilterStatus('Chết')}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg ${
                  filterStatus === 'Chết' 
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white scale-105' 
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-red-300'
                }`}
              >
                💀 Đã chết
              </button>
            </div>
          </div>
        </div>

        {/* Add New Plant Button */}
        <div className="mb-8 flex justify-center">
          <Link
            to="/my-plants/add"
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-3xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <span className="mr-3 text-2xl group-hover:rotate-90 transition-transform duration-300">➕</span>
            Thêm Cây Mới Vào Vườn
          </Link>
        </div>

        {/* Plants Grid */}
        {plants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-100">
            <div className="text-8xl mb-6">🌱</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Vườn cây còn trống</h3>
            <p className="text-gray-600 text-lg mb-8">Hãy thêm cây đầu tiên để bắt đầu hành trình trồng cây!</p>
            <Link
              to="/my-plants/add"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <span className="mr-2 text-xl">➕</span>
              Thêm Cây Đầu Tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {plants.map((plant) => (
              <div 
                key={plant.userPlantID} 
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 border-2 border-gray-100 hover:border-green-200 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={plant.imageUrl || '/placeholder-plant.jpg'}
                    alt={plant.productName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold shadow-lg border-2 ${getStatusColor(plant.status)}`}>
                    <span className="mr-1">{getStatusIcon(plant.status)}</span>
                    {plant.status}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors line-clamp-1">
                    {plant.nickname || plant.productName}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-1">
                    {plant.productName}
                  </p>
                  
                  {/* Info Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-gray-500 text-xs mb-1">Độ khó</p>
                      <p className="font-bold text-blue-700 text-sm">{plant.difficulty}</p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-3 border border-yellow-100">
                      <p className="text-gray-500 text-xs mb-1">☀️ Ánh sáng</p>
                      <p className="font-bold text-yellow-700 text-sm">{plant.lightRequirement}</p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-3 border border-cyan-100">
                      <p className="text-gray-500 text-xs mb-1">💧 Nước</p>
                      <p className="font-bold text-cyan-700 text-sm">{plant.waterRequirement}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      to={`/my-plants/${plant.userPlantID}`}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl font-semibold text-center shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      📋 Chi tiết
                    </Link>
                    <button
                      onClick={() => handleDelete(plant.userPlantID)}
                      className="px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPlantsPage;