// src/layouts/UserLayout.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const UserLayout: React.FC = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // ← MOBILE MENU
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinkClass = (path: string) => {
    const base = 'font-medium transition';
    return isActive(path)
      ? `${base} text-green-600 font-semibold`
      : `${base} text-gray-700 hover:text-green-600`;
  };

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
  };

  const userName = user?.fullName || user?.email?.split('@')[0] || 'Người dùng';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-green-600">Tree</span>
              </div>
              <span className="text-2xl font-bold text-green-600">PlantCare</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6 items-center">
              <Link to="/" className={navLinkClass('/')}>Cửa hàng</Link>
              
              {isAuthenticated && (
                <>
                  <Link to="/my-plants" className={navLinkClass('/my-plants')}>Cây của tôi</Link>
                  <Link to="/wiki" className={navLinkClass('/wiki')}>Wiki chăm sóc</Link>
                  <Link to="/recommendations" className={navLinkClass('/recommendations')}>Gợi ý cây</Link>
                </>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative text-gray-700 hover:text-green-600 transition">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {(cartCount ?? 0) > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isLoading ? (
                <span className="text-gray-500 text-sm">...</span>
              ) : isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-medium max-w-32 truncate">{userName}</span>
                    <svg className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-800">{user?.fullName || 'Người dùng'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        <Link to="/profile" onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Thông tin cá nhân
                        </Link>
                        <Link to="/my-plants" onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          Vườn cây của tôi
                        </Link>
                        <Link to="/orders" onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Đơn hàng
                        </Link>
                        <Link to="/change-password" onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Đổi mật khẩu
                        </Link>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="px-4 py-2 text-sm text-gray-700 hover:text-green-600 transition">
                    Đăng nhập
                  </Link>
                  <Link to="/register"
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                    Đăng ký
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-gray-700 hover:text-green-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div ref={mobileMenuRef} className="md:hidden bg-white border-t border-gray-200">
            <nav className="flex flex-col py-4 px-6 space-y-3">
              <Link to="/" onClick={() => setShowMobileMenu(false)} className={navLinkClass('/')}>Cửa hàng</Link>
              {isAuthenticated && (
                <>
                  <Link to="/my-plants" onClick={() => setShowMobileMenu(false)} className={navLinkClass('/my-plants')}>Cây của tôi</Link>
                  <Link to="/wiki" onClick={() => setShowMobileMenu(false)} className={navLinkClass('/wiki')}>Wiki chăm sóc</Link>
                  <Link to="/recommendations" onClick={() => setShowMobileMenu(false)} className={navLinkClass('/recommendations')}>Gợi ý cây</Link>
                </>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="text-red-600 text-sm">Đăng xuất</button>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" onClick={() => setShowMobileMenu(false)} className="text-sm text-gray-700">Đăng nhập</Link>
                    <Link to="/register" onClick={() => setShowMobileMenu(false)} className="text-sm text-green-600 font-medium">Đăng ký</Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">Tree</span> PlantCare
              </h3>
              <p className="text-gray-400 text-sm">
                Chăm sóc cây trồng dễ dàng hơn với hệ thống quản lý thông minh và gợi ý cá nhân hóa.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition">Cửa hàng</Link></li>
                <li><Link to="/my-plants" className="hover:text-white transition">Cây của tôi</Link></li>
                <li><Link to="/wiki" className="hover:text-white transition">Wiki chăm sóc</Link></li>
                <li><Link to="/recommendations" className="hover:text-white transition">Gợi ý cây</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/contact" className="hover:text-white transition">Liên hệ</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition">Vận chuyển</Link></li>
                <li><Link to="/return" className="hover:text-white transition">Đổi trả</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>support@plantcare.vn</li>
                <li>1900 123 456</li>
                <li>Hà Nội, Việt Nam</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>© 2025 PlantCare - Chăm sóc cây trồng dễ dàng hơn</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;