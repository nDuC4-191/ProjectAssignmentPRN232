// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// === Contexts ===
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';

// === Trang của Vinh/Đức Anh ===
import MyPlantsPage from './pages/MyPlantsPage';
import PlantDetailPage from './pages/PlantDetailPage';
import AddPlantPage from './pages/AddPlantPage';
import CareWikiPage from './pages/CareWikiPage';
import PlantRecommendationPage from './pages/PlantRecommendationPage';

// === Trang của Cảnh ===
import StoreHomePage from './pages/Store/StoreHomePage';
import ProductDetailPageStore from './pages/Store/ProductDetailPage';
import CartPage from './pages/Store/CartPage';
import CheckoutPage from './pages/Store/CheckoutPage';
import OrderSuccessPage from './pages/Store/OrderSuccessPage';

// === Trang Admin ===
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProductsPage from "./pages/Admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/Admin/AdminCategoriesPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import AdminOrdersPage from "./pages/Admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/Admin/AdminOrderDetailPage";

function App() {
  const { cartItemCount } = useCart();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* === Navigation === */}
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">

              {/* Logo */}
              <Link to="/" className="text-2xl font-bold text-green-600 flex items-center">
                🌱 PlantCare
              </Link>

              {/* Navigation Links */}
              <div className="flex gap-6 items-center">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-green-600 font-medium transition"
                >
                  Cửa hàng
                </Link>

                {/* Các link chỉ hiện khi đã đăng nhập */}
                {isAuthenticated && (
                  <>
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-green-600 font-medium transition"
                    >
                      Admin
                    </Link>
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
                  </>
                )}

                {/* === Icon Giỏ hàng === */}
                <Link to="/cart" className="relative text-gray-700 hover:text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {/* Auth section */}
                {isLoading && <span className="text-gray-500 text-sm">...</span>}
                {!isLoading && (
                  isAuthenticated ? (
                    <div className="flex items-center space-x-2">
                      <Link to="/profile" className="text-gray-700">
                        {user?.fullName}
                      </Link>
                      <button
                        onClick={logout}
                        className="text-sm text-gray-500 hover:text-red-500"
                      >
                        (Đăng xuất)
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                    >
                      Đăng nhập
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* === Routes === */}
        <Routes>
          {/* === Cửa hàng (Cảnh) === */}
          <Route path="/" element={<StoreHomePage />} />
          <Route path="/products/:id" element={<ProductDetailPageStore />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />

          {/* === Trang Vinh/Đức Anh === */}
          <Route path="/my-plants" element={<MyPlantsPage />} />
          <Route path="/my-plants/add" element={<AddPlantPage />} />
          <Route path="/my-plants/:id" element={<PlantDetailPage />} />
          <Route path="/wiki" element={<CareWikiPage />} />
          <Route path="/recommendations" element={<PlantRecommendationPage />} />

          {/* === Admin === */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />

          {/* === 404 === */}
          <Route
            path="*"
            element={<div className="text-center p-10">404 - Trang không tồn tại</div>}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// === Trang Home cũ ===
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
    </div>
  );
};

export default App;
