// src/pages/PlantRecommendationPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { careSuggestionApi } from '../../services/api.service';
import type { UserConditionDTO, ProductSuggestionDTO } from '../../types/userPlant.types';

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
      setRecommendations(results || []);
      setShowResults(true);
    } catch (error: any) {
      console.error('Error getting recommendations:', error);
      alert(error.message || 'Không thể lấy gợi ý');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gợi Ý Cây Phù Hợp</h1>
        <p className="text-gray-600">Tìm cây hoàn hảo dựa trên điều kiện của bạn</p>
      </div>

      {!showResults ? (
        /* Form */
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="space-y-8">
            {/* Light */}
            <div>
              <label className="block text-gray-700 font-bold mb-4 text-lg">
                Ánh sáng trong nhà/văn phòng?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Thấp', 'Vừa', 'Cao'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setCondition({ ...condition, lightAvailability: option })}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      condition.lightAvailability === option
                        ? 'border-yellow-500 bg-yellow-50 shadow-md'
                        : 'border-gray-200 hover:border-yellow-300 hover:shadow'
                    }`}
                  >
                    <p className="font-bold text-lg">{option}</p>
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
              <label className="block text-gray-700 font-bold mb-4 text-lg">
                Bạn có bao nhiêu thời gian chăm sóc?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Bận rộn', 'Vừa', 'Nhiều thời gian'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setCondition({ ...condition, timeAvailable: option })}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      condition.timeAvailable === option
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow'
                    }`}
                  >
                    <p className="font-bold text-lg">{option}</p>
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
              <label className="block text-gray-700 font-bold mb-4 text-lg">
                Kinh nghiệm trồng cây của bạn?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Mới', 'Trung bình', 'Có kinh nghiệm'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setCondition({ ...condition, experience: option })}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      condition.experience === option
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:shadow'
                    }`}
                  >
                    <p className="font-bold text-lg">{option}</p>
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
              className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  Đang tìm kiếm...
                </>
              ) : (
                'Tìm cây phù hợp'
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Results */
        <div>
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Tìm thấy {recommendations.length} loại cây phù hợp!
                </h2>
                <p className="text-gray-600 mt-1">
                  Ánh sáng: <strong>{condition.lightAvailability}</strong> • 
                  Thời gian: <strong>{condition.timeAvailable}</strong> • 
                  Kinh nghiệm: <strong>{condition.experience}</strong>
                </p>
              </div>
              <button
                onClick={resetForm}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                Tìm lại
              </button>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-xl p-16 text-center">
              <div className="text-6xl mb-4">Không có kết quả</div>
              <p className="text-gray-500 text-lg">Không tìm thấy cây phù hợp. Thử lại với điều kiện khác!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((plant) => (
                <div
                  key={plant.productID}  // SỬA: productID (in hoa)
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <img
                    src={plant.imageUrl || '/placeholder-plant.jpg'}
                    alt={plant.productName}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                      {plant.productName}
                    </h3>
                    {plant.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {plant.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        {plant.price.toLocaleString('vi-VN')}₫
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          plant.difficulty === 'Dễ'
                            ? 'bg-green-100 text-green-800'
                            : plant.difficulty === 'Trung bình'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {plant.difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-gray-500">Ánh sáng</p>
                        <p className="font-semibold text-gray-800">{plant.lightRequirement}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-gray-500">Nước</p>
                        <p className="font-semibold text-gray-800">{plant.waterRequirement}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/products/${plant.productID}`}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium transition"
                      >
                        Chi tiết
                      </Link>
                      <button className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">
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