// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MyPlantsPage from './pages/MyPlantsPage';
import PlantDetailPage from './pages/PlantDetailPage';
import CareWikiPage from './pages/CareWikiPage';
import PlantRecommendationPage from './pages/PlantRecommendationPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-2xl font-bold text-green-600 flex items-center">
                🌱 PlantCare
              </Link>
              
              <div className="flex gap-6">
                <Link 
                  to="/my-plants" 
                  className="text-gray-700 hover:text-green-600 font-medium transition"
                >
                  Cây của tôi
                </Link>
                <Link 
                  to="/wiki" 
                  className="text-gray-700 hover:text-green-600 font-medium transition"
                >
                  Wiki chăm sóc
                </Link>
                <Link 
                  to="/recommendations" 
                  className="text-gray-700 hover:text-green-600 font-medium transition"
                >
                  Gợi ý cây
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-plants" element={<MyPlantsPage />} />
          <Route path="/my-plants/:id" element={<PlantDetailPage />} />
          <Route path="/wiki" element={<CareWikiPage />} />
          <Route path="/recommendations" element={<PlantRecommendationPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// HomePage Component
const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Chào mừng đến với PlantCare 🌿
        </h1>
        <p className="text-xl text-gray-600">
          Quản lý và chăm sóc cây trồng của bạn một cách dễ dàng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Feature 1 */}
        <Link 
          to="/my-plants"
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition text-center group"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition">🌱</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Quản lý cây</h3>
          <p className="text-gray-600">
            Theo dõi danh sách cây, lịch tưới nước và bón phân
          </p>
        </Link>

        {/* Feature 2 */}
        <Link 
          to="/wiki"
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition text-center group"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition">📖</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Wiki chăm sóc</h3>
          <p className="text-gray-600">
            Hướng dẫn chi tiết cách chăm sóc từng loại cây
          </p>
        </Link>

        {/* Feature 3 */}
        <Link 
          to="/recommendations"
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition text-center group"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition">🌟</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Gợi ý cây</h3>
          <p className="text-gray-600">
            Tìm cây phù hợp với điều kiện và kinh nghiệm của bạn
          </p>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold mb-2">500+</p>
            <p className="text-lg">Loại cây</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">1000+</p>
            <p className="text-lg">Người dùng</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">5000+</p>
            <p className="text-lg">Cây được chăm sóc</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;