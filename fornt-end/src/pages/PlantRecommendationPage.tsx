// src/pages/PlantRecommendationPage.tsx
import React, { useState } from 'react';
import { careSuggestionApi } from '../services/api.service';
import type { UserConditionDTO, ProductSuggestionDTO } from '../types/userPlant.types';

const PlantRecommendationPage: React.FC = () => {
  const [condition, setCondition] = useState<UserConditionDTO>({
    lightAvailability: '',
    timeAvailable: '',
    experience: '',
  });
  const [recommendations, setRecommendations] = useState<ProductSuggestionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGetRecommendations = async () => {
    if (!condition.lightAvailability || !condition.timeAvailable || !condition.experience) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const results = await careSuggestionApi.getRecommendedPlants(condition);
      setRecommendations(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Không thể lấy gợi ý');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCondition({
      lightAvailability: '',
      timeAvailable: '',
      experience: '',
    });
    setRecommendations([]);
    setShowResults(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🌟 Gợi Ý Cây Phù Hợp</h1>
        <p className="text-gray-600">Tìm cây hoàn hảo dựa trên điều kiện của bạn</p>
      </div>

      {!showResults ? (
        /* Form */
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            {/* Light */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">
                ☀️ Ánh sáng trong nhà/văn phòng của bạn?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Thấp', 'Vừa', 'Cao'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setCondition({ ...condition, lightAvailability: option })}
                    className={`p-4 rounded-lg border-2 transition ${
                      condition.lightAvailability === option
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <p className="font-semibold">{option}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {option === 'Thấp' && 'Ít ánh sáng tự nhiên'}
                      {option === 'Vừa' && 'Có cửa sổ, ánh sáng vừa'}
                      {option === 'Cao' && 'Nhiều ánh sáng, ban công'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">
                ⏰ Bạn có bao nhiêu thời gian chăm sóc?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Bận rộn', 'Vừa', 'Nhiều thời gian'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setCondition({ ...condition, timeAvailable: option })}
                    className={`p-4 rounded-lg border-2 transition ${
                      condition.timeAvailable === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-semibold">{option}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {option === 'Bận rộn' && 'Ít thời gian, tưới 1-2 tuần/lần'}
                      {option === 'Vừa' && 'Tưới 2-3 lần/tuần'}
                      {option === 'Nhiều thời gian' && 'Chăm sóc hàng ngày'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">
                🌱 Kinh nghiệm trồng cây của bạn?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Mới', 'Trung bình', 'Có kinh nghiệm'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setCondition({ ...condition, experience: option })}
                    className={`p-4 rounded-lg border-2 transition ${
                      condition.experience === option
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <p className="font-semibold">{option}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {option === 'Mới' && 'Mới bắt đầu, cần cây dễ'}
                      {option === 'Trung bình' && 'Đã trồng vài loại cây'}
                      {option === 'Có kinh nghiệm' && 'Có thể chăm cây khó'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGetRecommendations}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang tìm kiếm...
                </span>
              ) : (
                '🔍 Tìm cây phù hợp'
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Results */
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Tìm thấy {recommendations.length} loại cây phù hợp! 🎉
                </h2>
                <p className="text-gray-600 mt-1">
                  Ánh sáng: {condition.lightAvailability} • Thời gian: {condition.timeAvailable} • 
                  Kinh nghiệm: {condition.experience}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                ← Tìm lại
              </button>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">😢</div>
              <p className="text-gray-500 text-lg">Không tìm thấy cây phù hợp. Thử lại với điều kiện khác!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((plant) => (
                <div key={plant.productID} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                  <img
                    src={plant.imageUrl || '/placeholder-plant.jpg'}
                    alt={plant.productName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{plant.productName}</h3>
                    {plant.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{plant.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        {plant.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        plant.difficulty === 'Dễ' ? 'bg-green-100 text-green-800' :
                        plant.difficulty === 'Trung bình' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {plant.difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Ánh sáng</p>
                        <p className="font-semibold">{plant.lightRequirement}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Nước</p>
                        <p className="font-semibold">{plant.waterRequirement}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Chi tiết
                      </button>
                      <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Mua ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlantRecommendationPage;