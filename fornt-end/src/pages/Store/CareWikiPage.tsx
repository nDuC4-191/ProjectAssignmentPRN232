import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PlantCareTipDTO {
  tipId: number;
  productId: number;
  title: string;
  content: string;
  category: string;
  sortOrder: number;
  createdAt: string;
  productName: string;
  productImage: string;
  difficulty: string;
  lightRequirement: string;
  waterRequirement: string;
  price: number;
}

interface PlantWikiListDTO {
  productId: number;
  productName: string;
  shortDescription: string;
  imageUrl: string;
  tipCount: number;
  difficulty: string;
}

const API_BASE_URL = "http://localhost:5239/api";

const CareWikiPage: React.FC = () => {
  const [plants, setPlants] = useState<PlantWikiListDTO[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [tips, setTips] = useState<PlantCareTipDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/PlantCareTip/plants`);
      if (res.data.success) {
        setPlants(res.data.data);
        setSelectedPlantId(null);
        setTips([]);
      }
    } catch (e) {
      alert("Không thể tải danh sách cây");
      setPlants([]);
      setSelectedPlantId(null);
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTipsByProduct = async (productId: number) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/PlantCareTip/product/${productId}`);
      if (res.data.success) {
        setTips(res.data.data);
        setSelectedPlantId(productId);
      } else {
        setTips([]);
      }
    } catch (e) {
      alert("Không thể tải hướng dẫn");
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPlants();
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/PlantCareTip/search`, {
        params: { keyword: searchTerm }
      });
      if (res.data.success) {
        const uniquePlants: PlantWikiListDTO[] = [];
        res.data.data.forEach((tip: PlantCareTipDTO) => {
          if (!uniquePlants.find(p => p.productId === tip.productId)) {
            uniquePlants.push({
              productId: tip.productId,
              productName: tip.productName,
              shortDescription: '',
              imageUrl: tip.productImage,
              tipCount: 1,
              difficulty: tip.difficulty
            });
          }
        });
        setPlants(uniquePlants);
        setSelectedPlantId(null);
        setTips([]);
      }
    } catch (e) {
      alert("Không thể tìm kiếm cây");
      setPlants([]);
      setSelectedPlantId(null);
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  const groupTipsByCategory = (tips: PlantCareTipDTO[]) => {
    return tips.reduce((acc, tip) => {
      const category = tip.category || "Khác";
      if (!acc[category]) acc[category] = [];
      acc[category].push(tip);
      return acc;
    }, {} as Record<string, PlantCareTipDTO[]>);
  };

  const selectedPlant = plants.find((p) => p.productId === selectedPlantId) || null;
  const groupedTips = groupTipsByCategory(tips);

  const categoryIcons: Record<string, string> = {
    "Tổng quan": "🌱",
    "Tưới nước": "💧",
    "Ánh sáng": "☀️",
    "Bón phân": "🌿",
    "Nhiệt độ": "🌡️",
    "Đất trồng": "🪴",
    "Cắt tỉa": "✂️",
    "Thay chậu": "🏺",
    "Bệnh": "🩹",
    "Mùa vụ": "📅",
    "Khác": "📌",
  };

  const categoryColors: Record<string, string> = {
    "Tổng quan": "from-green-500 to-emerald-500",
    "Tưới nước": "from-blue-500 to-cyan-500",
    "Ánh sáng": "from-yellow-500 to-orange-500",
    "Bón phân": "from-lime-500 to-green-500",
    "Nhiệt độ": "from-red-500 to-pink-500",
    "Đất trồng": "from-amber-500 to-yellow-500",
    "Cắt tỉa": "from-purple-500 to-pink-500",
    "Thay chậu": "from-orange-500 to-red-500",
    "Bệnh": "from-rose-500 to-red-500",
    "Mùa vụ": "from-indigo-500 to-blue-500",
    "Khác": "from-gray-500 to-slate-500",
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 border-t-green-600"></div>
          <span className="absolute inset-0 flex items-center justify-center text-3xl">📖</span>
        </div>
        <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải wiki chăm sóc cây...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-7xl">📚</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Wiki Chăm Sóc Cây
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hướng dẫn chi tiết từng bước để chăm sóc cây trồng của bạn một cách chuyên nghiệp
          </p>
        </div>

        {/* Search */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm hướng dẫn hoặc tên cây..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all outline-none text-lg"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Plant List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden sticky top-4 border border-gray-100">
              <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <span>🌿</span>
                  <span>Danh sách cây</span>
                </h3>
                <p className="text-green-100 text-sm mt-1">{plants.length} loại cây</p>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-280px)] overflow-y-auto">
                {plants.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-4">🌱</div>
                    <p className="text-gray-500 text-sm">Không tìm thấy cây nào</p>
                  </div>
                ) : (
                  plants.map((plant) => (
                    <button
                      key={plant.productId}
                      onClick={() => loadTipsByProduct(plant.productId)}
                      className={`w-full text-left px-5 py-4 hover:bg-green-50 transition-all group ${
                        selectedPlantId === plant.productId 
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600" 
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {plant.imageUrl && (
                          <div className="relative">
                            <img
                              src={plant.imageUrl}
                              alt={plant.productName}
                              className="w-16 h-16 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-gray-800 mb-2 line-clamp-2 ${
                            selectedPlantId === plant.productId ? 'text-green-700' : ''
                          }`}>
                            {plant.productName}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full font-semibold border border-blue-200">
                              {plant.difficulty}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              📝 {plant.tipCount} tips
                            </span>
                          </div>
                          {plant.shortDescription && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {plant.shortDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Tips Detail */}
          <div className="lg:col-span-3">
            {selectedPlant && tips.length > 0 ? (
              <div className="space-y-6">
                {/* Plant Header Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-start gap-6">
                    {selectedPlant.imageUrl && (
                      <div className="relative group">
                        <img
                          src={selectedPlant.imageUrl}
                          alt={selectedPlant.productName}
                          className="w-32 h-32 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                        {selectedPlant.productName}
                      </h2>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-bold border-2 border-green-200">
                          📊 {selectedPlant.difficulty}
                        </span>
                        {tips[0]?.lightRequirement && (
                          <span className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-bold border-2 border-yellow-200">
                            ☀️ {tips[0].lightRequirement}
                          </span>
                        )}
                        {tips[0]?.waterRequirement && (
                          <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full text-sm font-bold border-2 border-blue-200">
                            💧 {tips[0].waterRequirement}
                          </span>
                        )}
                        <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-bold border-2 border-purple-200">
                          📝 {tips.length} hướng dẫn
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips by Category */}
                {Object.entries(groupedTips).map(([category, categoryTips]) => (
                  <div key={category} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className={`p-6 bg-gradient-to-r ${categoryColors[category] || 'from-gray-500 to-slate-500'} text-white`}>
                      <h3 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">{categoryIcons[category] || "📌"}</span>
                        <span>{category}</span>
                      </h3>
                      <p className="text-white/90 text-sm mt-1">{categoryTips.length} mẹo chăm sóc</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {categoryTips.map((tip, index) => (
                        <div 
                          key={tip.tipId} 
                          className="group relative pl-8 py-4 border-l-4 border-green-500 bg-gradient-to-r from-green-50/50 to-transparent rounded-r-2xl hover:from-green-100/70 transition-all"
                        >
                          <div className="absolute -left-3 top-4 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            {index + 1}
                          </div>
                          
                          <h4 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-green-700 transition-colors">
                            {tip.title}
                          </h4>
                          
                          <div
                            className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base"
                            dangerouslySetInnerHTML={{
                              __html: tip.content.replace(/\n/g, "<br/>")
                            }}
                          />
                          
                          {tip.createdAt && (
                            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                              <span>🕒</span>
                              <span>{new Date(tip.createdAt).toLocaleDateString('vi-VN')}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-100">
                <div className="text-8xl mb-6">📖</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  {plants.length === 0 ? "Không có hướng dẫn nào" : "Chọn một cây để xem hướng dẫn"}
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  {plants.length === 0
                    ? "Vui lòng thêm dữ liệu vào database để hiển thị hướng dẫn chăm sóc cây."
                    : "Hãy chọn một loại cây từ danh sách bên trái để xem hướng dẫn chi tiết về cách chăm sóc."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareWikiPage;