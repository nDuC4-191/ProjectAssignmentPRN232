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

const API_BASE_URL = "http://localhost:7002/api";

const CareWikiPage: React.FC = () => {
  const [plants, setPlants] = useState<PlantWikiListDTO[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [tips, setTips] = useState<PlantCareTipDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Load tất cả cây khi load trang
  useEffect(() => {
    loadPlants();
  }, []);

  // Lấy danh sách cây sidebar
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

  // Lấy tips của 1 cây khi chọn
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

  // Tìm kiếm tip sẽ ra danh sách tips => gom lại unique cây cho UI
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
        // Gom tips theo product cho UI sidebar (tương tự như plants)
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

  // Gom tips theo category cho UI, không đổi
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
            placeholder="Tìm kiếm tip hoặc cây..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Tìm
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Plant List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden sticky top-4">
            <div className="p-4 bg-green-500 text-white font-bold">
              Danh sách cây ({plants.length})
            </div>
            <div className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
              {plants.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Không tìm thấy cây nào</p>
                </div>
              ) : (
                plants.map((plant) => (
                  <button
                    key={plant.productId}
                    onClick={() => loadTipsByProduct(plant.productId)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                      selectedPlantId === plant.productId ? "bg-green-50 border-l-4 border-green-500" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {plant.imageUrl && (
                        <img
                          src={plant.imageUrl}
                          alt={plant.productName}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{plant.productName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{plant.difficulty}</span>
                          <span className="text-xs text-gray-500">{plant.tipCount} tips</span>
                        </div>
                        {plant.shortDescription && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{plant.shortDescription}</p>
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
        <div className="lg:col-span-2">
          {selectedPlant && tips.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-4">
                  {selectedPlant.imageUrl && (
                    <img
                      src={selectedPlant.imageUrl}
                      alt={selectedPlant.productName}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedPlant.productName}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{selectedPlant.difficulty}</span>
                      {tips[0]?.lightRequirement && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                          ☀️ {tips[0].lightRequirement}
                        </span>
                      )}
                      {tips[0]?.waterRequirement && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          💧 {tips[0].waterRequirement}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {Object.entries(groupedTips).map(([category, categoryTips]) => (
                <div key={category} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>{categoryIcons[category] || "📌"}</span>
                    <span>{category}</span>
                  </h3>
                  <div className="space-y-4">
                    {categoryTips.map((tip) => (
                      <div key={tip.tipId} className="border-l-4 border-green-500 pl-4 py-2">
                        <h4 className="font-semibold text-gray-800 mb-2">{tip.title}</h4>
                        <div
                          className="text-gray-600 leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: tip.content.replace(/\n/g, "<br/>")
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-gray-500 text-lg">
                {plants.length === 0
                  ? "Không có hướng dẫn nào. Vui lòng thêm dữ liệu vào database."
                  : "Chọn một cây từ danh sách bên trái để xem hướng dẫn chi tiết"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareWikiPage;
