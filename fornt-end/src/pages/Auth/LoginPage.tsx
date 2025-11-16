// src/pages/Auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import type { User } from '../../services/auth.service'; // ← ĐÃ export trong auth.service.ts

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

  const from = (location.state as any)?.from?.pathname || '/';

  const decodeToken = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
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
      const token = response.token;

      if (!token) throw new Error('Token không tồn tại');

      // ƯU TIÊN: Dùng user từ backend (đã đầy đủ)
      if (response.user) {
        login(token, response.user);
        const role = response.user.role.toLowerCase();
        navigate(role === 'admin' ? '/admin/dashboard' : from, { replace: true });
        return;
      }

      // FALLBACK: Tạo user từ token
      const decoded = decodeToken(token);
      if (!decoded) throw new Error('Token không hợp lệ');

      const roleClaimPath = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const userIdClaimPath = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      const nameClaimPath = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

      const user: User = {
        userId: Number(decoded[userIdClaimPath] || decoded.sub || decoded.id || 0),
        email: decoded.email || formData.email,
        fullName: decoded[nameClaimPath] || decoded.fullName || decoded.name || formData.email.split('@')[0],
        role: (decoded[roleClaimPath] || decoded.role || 'customer').toLowerCase(),
        // BỔ SUNG 3 TRƯỜNG BẮT BUỘC
        isActive: true,
        isEmailVerified: !!decoded.email_verified_at || false,
        createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
        phone: decoded.phone,
        address: decoded.address,
        avatarUrl: decoded.picture,
      };

      login(token, user);
      navigate(user.role === 'admin' ? '/admin/dashboard' : from, { replace: true });

    } catch (err: any) {
      let message = 'Đăng nhập thất bại!';

      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.message;

        switch (status) {
          case 400:
          case 401: message = 'Email hoặc mật khẩu không đúng!'; break;
          case 403: message = 'Tài khoản bị khóa!'; break;
          case 404: message = 'Tài khoản không tồn tại!'; break;
          case 500: message = 'Lỗi server!'; break;
          default: message = msg || message;
        }
      } else if (err.request) {
        message = 'Không kết nối được server!';
      } else {
        message = err.message || message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">PlantCare</h1>
          <p className="text-gray-600">Đăng nhập để tiếp tục</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Đăng nhập</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
              <span className="mr-2">Error</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <span className="ml-2 text-sm text-gray-600">Ghi nhớ</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-semibold">
                Quên mật khẩu?
              </Link>
            </div>

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
                'Login'
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

        <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
          <p className="text-sm font-semibold text-gray-700 mb-2">Demo Accounts:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Admin:</strong> admin@plantcare.com / Admin@12345</div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;