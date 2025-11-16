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
  const [showPassword, setShowPassword] = useState(false);

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
      console.error('❌ Error decoding token:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gọi API login
      const response = await authService.login(formData);
      
      // Lấy token từ response
      const token = response.token;
      
      if (!token) {
        throw new Error('Token không tồn tại trong response');
      }

      // Decode token để lấy user info
      const decoded = decodeToken(token);
      console.log('🔍 Decoded token:', decoded);
      
      // Lấy role từ claim path của .NET
      const roleClaimPath = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const userIdClaimPath = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      const nameClaimPath = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
      
      const userRole = (
        decoded?.[roleClaimPath] || 
        decoded?.role || 
        'customer'
      ).toLowerCase();
      
      const userId = decoded?.[userIdClaimPath] || 
                     decoded?.userId || 
                     decoded?.sub ||
                     decoded?.id;
      
      const userName = decoded?.[nameClaimPath] ||
                       decoded?.fullName || 
                       decoded?.name || 
                       decoded?.email?.split('@')[0] ||
                       'User';
      
      // Tạo user object theo format AuthContext
      const user = {
        userId: userId,
        email: decoded?.email || formData.email,
        fullName: userName,
        role: userRole,
      };

      console.log('✅ User object:', user);
      console.log('✅ User role:', userRole);

      // Gọi login từ context để lưu vào state + localStorage
      login(token, user);

      // Hiển thị thông báo thành công
      if (response.message) {
        console.log('✅ ' + response.message);
      }

      // Redirect logic
      if (userRole === 'admin') {
        console.log('🔄 Redirecting to admin dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('🔄 Redirecting to:', from || '/');
        navigate(from || '/', { replace: true });
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      
      // Xử lý các loại lỗi
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message;

        switch (status) {
          case 400:
          case 401:
            setError('Email hoặc mật khẩu không đúng!');
            break;
          case 404:
            setError('Tài khoản không tồn tại!');
            break;
          case 403:
            setError('Tài khoản đã bị khóa. Vui lòng liên hệ admin!');
            break;
          case 500:
            setError('Lỗi server. Vui lòng thử lại sau!');
            break;
          default:
            setError(message || 'Đăng nhập thất bại!');
        }
      } else if (err.request) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra mạng!');
      } else {
        setError(err.message || 'Email hoặc mật khẩu không đúng!');
      }
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
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
              <span className="mr-2">❌</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="your@email.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 font-semibold transition"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Đang đăng nhập...
                </span>
              ) : (
                '🔓 Đăng nhập'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{' '}
              <Link 
                to="/register" 
                className="text-green-600 hover:text-green-700 font-semibold transition"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            🚀 Demo Accounts (for testing):
          </p>
          <div className="text-xs text-gray-600 space-y-1">
            <div>👨‍💼 <strong>Admin:</strong> admin@plantcare.com / Admin@12345</div>
            <div>👤 <strong>Customer:</strong> customer@plantcare.com / Customer@12345</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;