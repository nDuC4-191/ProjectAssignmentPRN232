// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// === Contexts ===
import { useAuth } from './contexts/AuthContext';

// === Layouts ===
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// === Auth Pages (No Layout) ===
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage";

// === User Pages (Store) ===
import StoreHomePage from './pages/Store/StoreHomePage';
import ProductDetailPageStore from './pages/Store/ProductDetailPage';
import CartPage from './pages/Store/CartPage';
import CheckoutPage from './pages/Store/CheckoutPage';
import OrderSuccessPage from './pages/Store/OrderSuccessPage';
import CareWikiPage from './pages/Store/CareWikiPage';

// === User Pages (My Plants) ===
import MyPlantsPage from './pages/Store/MyPlantsPage';
import PlantDetailPage from './pages/Store/PlantDetailPage';
import AddPlantPage from './pages/Store/AddPlantPage';
import PlantRecommendationPage from './pages/Store/PlantRecommendationPage';

// === User Profile === ← THÊM IMPORT
import ProfilePage from './pages/ProfilePage';

// === Admin Pages ===
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProductsPage from "./pages/Admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/Admin/AdminCategoriesPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import AdminOrdersPage from "./pages/Admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/Admin/AdminOrderDetailPage";

// === Protected Route Component ===
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'admin' | 'customer' }> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Lưu URL hiện tại để redirect về sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role
  const userRole = user?.role?.toLowerCase();

  if (requiredRole === 'admin' && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'customer' && userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* ========== AUTH ROUTES (No Layout) ========== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* ========== ADMIN ROUTES (AdminLayout) ========== */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
      </Route>

      {/* ========== USER ROUTES (UserLayout) ========== */}
      <Route path="/*" element={<UserLayout />}>
        {/* Store - PUBLIC (không cần login) */}
        <Route index element={<StoreHomePage />} />
        <Route path="products/:id" element={<ProductDetailPageStore />} />
        
        {/* Profile - CẦN LOGIN ← THÊM ROUTE NÀY */}
        <Route path="profile" element={
          <ProtectedRoute requiredRole="customer">
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Cart & Checkout - CẦN LOGIN */}
        <Route path="cart" element={
          <ProtectedRoute requiredRole="customer">
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path="checkout" element={
          <ProtectedRoute requiredRole="customer">
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="order-success/:orderId" element={
          <ProtectedRoute requiredRole="customer">
            <OrderSuccessPage />
          </ProtectedRoute>
        } />

        {/* My Plants - CẦN LOGIN */}
        <Route path="my-plants" element={
          <ProtectedRoute requiredRole="customer">
            <MyPlantsPage />
          </ProtectedRoute>
        } />
        <Route path="my-plants/add" element={
          <ProtectedRoute requiredRole="customer">
            <AddPlantPage />
          </ProtectedRoute>
        } />
        <Route path="my-plants/:id" element={
          <ProtectedRoute requiredRole="customer">
            <PlantDetailPage />
          </ProtectedRoute>
        } />
        <Route path="wiki" element={<CareWikiPage />} />
        <Route path="recommendations" element={
          <ProtectedRoute requiredRole="customer">
            <PlantRecommendationPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* ========== 404 FALLBACK ========== */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-gray-600">Trang không tồn tại</p>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;