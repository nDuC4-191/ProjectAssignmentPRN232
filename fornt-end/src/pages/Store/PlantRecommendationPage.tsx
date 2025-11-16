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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-7xl">🔮</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
            Tìm Cây Hoàn Hảo Cho Bạn
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trả lời vài câu hỏi đơn giản để chúng tôi gợi ý loại cây phù hợp nhất với không gian và lối sống của bạn
          </p>
        </div>

        {!showResults ? (
          /* Form */
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <div className="space-y-12">
              {/* Light */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">☀️</span>
                  <div>
                    <label className="block text-gray-800 font-bold text-2xl">
                      Ánh sáng trong không gian của bạn?
                    </label>
                    <p className="text-gray-500 text-sm mt-1">Chọn mức độ ánh sáng tự nhiên</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'Thấp', icon: '🌑', desc: 'Ít ánh sáng tự nhiên, xa cửa sổ' },
                    { value: 'Vừa', icon: '⛅', desc: 'Có cửa sổ, ánh sáng gián tiếp' },
                    { value: 'Cao', icon: '☀️', desc: 'Nhiều ánh sáng, ban công hoặc sân' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCondition({ ...condition, lightAvailability: option.value })}
                      className={`group p-6 rounded-2xl border-3 transition-all text-center ${
                        condition.lightAvailability === option.value
                          ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl scale-105 ring-4 ring-yellow-200'
                          : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-lg hover:scale-102'
                      }`}
                    >
                      <div className="text-5xl mb-3">{option.icon}</div>
                      <p className="font-bold text-xl text-gray-800 mb-2">{option.value}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">⏰</span>
                  <div>
                    <label className="block text-gray-800 font-bold text-2xl">
                      Bạn có bao nhiêu thời gian chăm sóc?
                    </label>
                    <p className="text-gray-500 text-sm mt-1">Ước tính thời gian bạn có thể dành cho cây</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'Bận rộn', icon: '⚡', desc: 'Ít thời gian, tưới 1-2 tuần/lần' },
                    { value: 'Vừa', icon: '🕒', desc: 'Tưới và kiểm tra 2-3 lần/tuần' },
                    { value: 'Nhiều thời gian', icon: '⏳', desc: 'Có thể chăm sóc hàng ngày' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCondition({ ...condition, timeAvailable: option.value })}
                      className={`group p-6 rounded-2xl border-3 transition-all text-center ${
                        condition.timeAvailable === option.value
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl scale-105 ring-4 ring-blue-200'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg hover:scale-102'
                      }`}
                    >
                      <div className="text-5xl mb-3">{option.icon}</div>
                      <p className="font-bold text-xl text-gray-800 mb-2">{option.value}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">🌱</span>
                  <div>
                    <label className="block text-gray-800 font-bold text-2xl">
                      Kinh nghiệm trồng cây của bạn?
                    </label>
                    <p className="text-gray-500 text-sm mt-1">Đánh giá mức độ am hiểu về cây trồng</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'Mới', icon: '🌱', desc: 'Mới bắt đầu, cần cây dễ chăm' },
                    { value: 'Trung bình', icon: '🪴', desc: 'Đã trồng thành công vài loại' },
                    { value: 'Có kinh nghiệm', icon: '🌳', desc: 'Tự tin với cây khó chăm' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCondition({ ...condition, experience: option.value })}
                      className={`group p-6 rounded-2xl border-3 transition-all text-center ${
                        condition.experience === option.value
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl scale-105 ring-4 ring-green-200'
                          : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-lg hover:scale-102'
                      }`}
                    >
                      <div className="text-5xl mb-3">{option.icon}</div>
                      <p className="font-bold text-xl text-gray-800 mb-2">{option.value}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  onClick={handleGetRecommendations}
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-7 w-7 border-3 border-white border-t-transparent"></div>
                      <span>Đang phân tích...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🔍</span>
                      <span>Tìm Cây Hoàn Hảo Cho Tôi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-8">
            {/* Results Header */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">✨</span>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      Tìm thấy {recommendations.length} loại cây hoàn hảo!
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-bold border-2 border-yellow-200">
                      ☀️ {condition.lightAvailability}
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full text-sm font-bold border-2 border-blue-200">
                      ⏰ {condition.timeAvailable}
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-bold border-2 border-green-200">
                      🌱 {condition.experience}
                    </span>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-slate-100 hover:from-gray-200 hover:to-slate-200 text-gray-700 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl border-2 border-gray-300"
                >
                  🔄 Tìm lại
                </button>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-20 text-center border border-gray-100">
                <div className="text-8xl mb-6">🤔</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Không tìm thấy cây phù hợp</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Rất tiếc! Không có cây nào phù hợp với điều kiện hiện tại. Hãy thử điều chỉnh lại các lựa chọn của bạn.
                </p>
                <button
                  onClick={resetForm}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Thử lại ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((plant) => (
                  <div
                    key={plant.productID}
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 border-2 border-gray-100 hover:border-green-200 hover:-translate-y-2"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={plant.imageUrl || '/placeholder-plant.jpg'}
                        alt={plant.productName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Difficulty Badge */}
                      <div
                        className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold shadow-lg border-2 ${
                          plant.difficulty === 'Dễ'
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'
                            : plant.difficulty === 'Trung bình'
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200'
                            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200'
                        }`}
                      >
                        {plant.difficulty === 'Dễ' && '⭐ '}
                        {plant.difficulty === 'Trung bình' && '⭐⭐ '}
                        {plant.difficulty === 'Khó' && '⭐⭐⭐ '}
                        {plant.difficulty}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors line-clamp-1">
                        {plant.productName}
                      </h3>
                      
                      {/* Description */}
                      {plant.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {plant.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mb-4">
                        <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          {plant.price.toLocaleString('vi-VN')}₫
                        </span>
                      </div>

                      {/* Requirements Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 text-center border border-yellow-200">
                          <p className="text-gray-500 text-xs mb-1">☀️ Ánh sáng</p>
                          <p className="font-bold text-yellow-800 text-sm">{plant.lightRequirement}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 text-center border border-blue-200">
                          <p className="text-gray-500 text-xs mb-1">💧 Nước</p>
                          <p className="font-bold text-blue-800 text-sm">{plant.waterRequirement}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Link
                          to={`/products/${plant.productID}`}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl text-center font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          📋 Chi tiết
                        </Link>
                        <button className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                          🛒 Mua ngay
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
    </div>
  );
};

export default PlantRecommendationPage;