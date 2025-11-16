// src/pages/Auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy URL trước đó (nếu có)
  const from = (location.state as any)?.from?.pathname || null;

  // Helper function để decode JWT token
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData);
      
      // Lấy token từ response hoặc localStorage
      const token = response.token || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token không tồn tại');
      }

      // Decode token để lấy user info
      const decoded = decodeToken(token);
      
      // Lấy role từ claim path của .NET (dài)
      const roleClaimPath = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const userIdClaimPath = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      
      const userRole = (
        decoded?.[roleClaimPath] || 
        decoded?.role || 
        'customer'
      ).toLowerCase();
      
      // Lấy userId từ nameidentifier claim
      const userId = decoded?.[userIdClaimPath] || 
                     decoded?.userId || 
                     decoded?.sub;
      
      // Tạo user object
      const user = {
        userId: userId,
        email: decoded?.email,
        fullName: decoded?.fullName || decoded?.name || decoded?.email?.split('@')[0],
        role: userRole,
      };

      console.log('🔍 Decoded token:', decoded);
      console.log('🔍 User object:', user);
      console.log('🔍 User role:', userRole);

      // Gọi login từ context để lưu vào state
      login(token, user);

      alert('✅ ' + response.message);

      // Redirect logic
      if (userRole === 'admin') {
        console.log('🔍 Redirecting to admin dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('🔍 Redirecting to:', from || '/');
        // Customer: Quay về trang trước đó (ví dụ /cart) hoặc trang chủ
        navigate(from || '/', { replace: true });
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Email hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">🌱 PlantCare</h1>
          <p className="text-gray-600">Đăng nhập để tiếp tục</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Đăng nhập</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Login (for testing) */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Demo Admin: admin@plantcare.com / Admin@12345</p>
          <p>Demo Customer: customer@plantcare.com / Customer@12345</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;