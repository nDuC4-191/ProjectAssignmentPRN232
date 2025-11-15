// src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinkClass = (path: string) => {
    return isActive(path)
      ? 'text-green-400 font-semibold'
      : 'text-white hover:text-green-400 transition';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="text-3xl">🛠️</span>
              <span className="text-2xl font-bold">PlantCare Admin</span>
            </Link>

            {/* Navigation */}
            <nav className="flex gap-6 items-center">
              <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                📊 Dashboard
              </Link>
              <Link to="/admin/products" className={navLinkClass('/admin/products')}>
                🌿 Sản phẩm
              </Link>
              <Link to="/admin/categories" className={navLinkClass('/admin/categories')}>
                📁 Danh mục
              </Link>
              <Link to="/admin/orders" className={navLinkClass('/admin/orders')}>
                📦 Đơn hàng
              </Link>
              <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                👥 Người dùng
              </Link>

              {/* User Info */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-600">
                <span className="text-sm text-gray-300">
                  👤 {user?.fullName || 'Admin'}
                </span>
                <button 
                  onClick={logout}
                  className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          © 2024 PlantCare Admin Panel - Quản lý hệ thống
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;