// src/pages/CareWikiPage.tsx
import React, { useState, useEffect } from 'react';
import { careSuggestionApi } from '../services/api.service';
import type { PlantCareGuideDTO } from '../types/userPlant.types';

const CareWikiPage: React.FC = () => {
  const [guides, setGuides] = useState<PlantCareGuideDTO[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<PlantCareGuideDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const data = await careSuggestionApi.getAllGuides();
      setGuides(data);
    } catch (error) {
      console.error('Error loading guides:', error);
      alert('Không thể tải hướng dẫn');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadGuides();
      return;
    }
    try {
      const results = await careSuggestionApi.searchGuides(searchTerm);
      setGuides(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleSelectGuide = (guide: PlantCareGuideDTO) => {
    setSelectedGuide(guide);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📖 Wiki Chăm Sóc Cây</h1>
        <p className="text-gray-600">Hướng dẫn chi tiết cách chăm sóc từng loại cây</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-green-500 text-white font-bold">
              Danh sách cây ({guides.length})
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {guides.map((guide) => (
                <button
                  key={guide.productID}
                  onClick={() => handleSelectGuide(guide)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                    selectedGuide?.productID === guide.productID ? 'bg-green-50' : ''
                  }`}
                >
                  <p className="font-semibold text-gray-800">{guide.productName}</p>
                  {guide.generalCare && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{guide.generalCare}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selectedGuide ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedGuide.productName}</h2>
              
              {selectedGuide.generalCare && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Mô tả chung</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedGuide.generalCare}</p>
                </div>
              )}

              {/* Watering Guide */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  💧 Hướng dẫn tưới nước
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-semibold">Tần suất:</span> {selectedGuide.wateringGuide.frequency}</p>
                  <p><span className="font-semibold">Lượng nước:</span> {selectedGuide.wateringGuide.amount}</p>
                  <p><span className="font-semibold">Dấu hiệu:</span> {selectedGuide.wateringGuide.signs}</p>
                </div>
              </div>

              {/* Light Guide */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  ☀️ Ánh sáng
                </h3>
                <div className="bg-yellow-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-semibold">Yêu cầu:</span> {selectedGuide.lightGuide.requirement}</p>
                  <p><span className="font-semibold">Thời gian:</span> {selectedGuide.lightGuide.duration}</p>
                  <p><span className="font-semibold">Vị trí:</span> {selectedGuide.lightGuide.placement}</p>
                </div>
              </div>

              {/* Fertilizing Guide */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  🌿 Bón phân
                </h3>
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-semibold">Tần suất:</span> {selectedGuide.fertilizingGuide.frequency}</p>
                  <p><span className="font-semibold">Loại phân:</span> {selectedGuide.fertilizingGuide.type}</p>
                  <p><span className="font-semibold">Mùa:</span> {selectedGuide.fertilizingGuide.season}</p>
                </div>
              </div>

              {/* Soil Guide */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  🪴 Đất trồng
                </h3>
                <div className="bg-orange-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-semibold">Loại:</span> {selectedGuide.soilGuide.type}</p>
                  <p><span className="font-semibold">pH:</span> {selectedGuide.soilGuide.pH}</p>
                  <p><span className="font-semibold">Thoát nước:</span> {selectedGuide.soilGuide.drainage}</p>
                </div>
              </div>

              {/* Common Issues */}
              {selectedGuide.commonIssues && selectedGuide.commonIssues.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    ⚠️ Vấn đề thường gặp
                  </h3>
                  <div className="bg-red-50 rounded-lg p-4">
                    <ul className="list-disc list-inside space-y-2">
                      {selectedGuide.commonIssues.map((issue, index) => (
                        <li key={index} className="text-gray-700">{issue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tips */}
              {selectedGuide.tips && selectedGuide.tips.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    💡 Mẹo chăm sóc
                  </h3>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <ul className="list-disc list-inside space-y-2">
                      {selectedGuide.tips.map((tip, index) => (
                        <li key={index} className="text-gray-700">{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-gray-500 text-lg">Chọn một cây để xem hướng dẫn chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareWikiPage;