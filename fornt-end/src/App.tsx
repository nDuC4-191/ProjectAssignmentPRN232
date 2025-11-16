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
import ChangePasswordPage from './pages/Auth/ChangePasswordPage';

// === User Pages (Store) ===
import StoreHomePage from './pages/Store/StoreHomePage';
import ProductDetailPageStore from './pages/Store/ProductDetailPage';
import CartPage from './pages/Store/CartPage';
import CheckoutPage from './pages/Store/CheckoutPage';
import OrderSuccessPage from './pages/Store/OrderSuccessPage';
import CareWikiPage from './pages/Store/CareWikiPage';

// === My Plants ===
import MyPlantsPage from './pages/Store/MyPlantsPage';
import PlantDetailPage from './pages/Store/PlantDetailPage';
import AddPlantPage from './pages/Store/AddPlantPage';
import PlantRecommendationPage from './pages/Store/PlantRecommendationPage';

// === Profile & Orders ===
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/Store/OrdersPage';

// === Admin Pages ===
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProductsPage from "./pages/Admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/Admin/AdminCategoriesPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import AdminOrdersPage from "./pages/Admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/Admin/AdminOrderDetailPage";

// === Protected Route Component ===
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredRole?: 'admin' | 'customer' 
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role?.toLowerCase();

  if (requiredRole === 'admin' && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'customer' && userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

// === Main App ===
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
      <Route element={<UserLayout />}>
        
        {/* === PUBLIC PAGES === */}
        <Route index element={<StoreHomePage />} />
        <Route path="products/:id" element={<ProductDetailPageStore />} />
        <Route path="wiki" element={<CareWikiPage />} />

        {/* === PROTECTED PAGES (Customer Only) === */}
        <Route path="profile" element={
          <ProtectedRoute requiredRole="customer">
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* ========== CHANGE PASSWORD ROUTE ========== */}
        <Route path="change-password" element={
          <ProtectedRoute requiredRole="customer">
            <ChangePasswordPage />
          </ProtectedRoute>
        } />

        <Route path="orders" element={
          <ProtectedRoute requiredRole="customer">
            <OrdersPage />
          </ProtectedRoute>
        } />

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

        {/* === MY PLANTS === */}
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
        <Route path="recommendations" element={
          <ProtectedRoute requiredRole="customer">
            <PlantRecommendationPage />
          </ProtectedRoute>
        } />

        {/* === 404 trong UserLayout === */}
        <Route path="*" element={
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-gray-600 mb-6">Trang không tồn tại</p>
            <a href="/" className="text-green-600 hover:underline">Quay về trang chủ</a>
          </div>
        } />
      </Route>

      {/* ========== GLOBAL 404 (nếu ngoài UserLayout) ========== */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;