// src/pages/Auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(response.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
      }
    } catch (err: any) {
      console.error('❌ Forgot password error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">🌱 PlantCare</h1>
          <p className="text-gray-600">Khôi phục mật khẩu</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quên mật khẩu?</h2>
            <p className="text-gray-600 text-sm">
              Nhập email của bạn, chúng tôi sẽ gửi link khôi phục mật khẩu
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <p className="font-semibold flex items-center">
                <span className="mr-2">✅</span> Thành công!
              </p>
              <p className="text-sm mt-1">
                Đã gửi email khôi phục mật khẩu! Vui lòng kiểm tra hộp thư (kể cả thư rác).
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
              <span className="mr-2">❌</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="your@email.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Đang gửi...
                </span>
              ) : (
                '📧 Gửi yêu cầu khôi phục'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-3">
            <Link
              to="/login"
              className="block text-center text-green-600 hover:text-green-700 font-semibold transition"
            >
              ← Quay lại đăng nhập
            </Link>
            <p className="text-center text-gray-600 text-sm">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Info Tip */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            💡 <strong>Tip:</strong> Kiểm tra cả thư mục Spam/Junk nếu không thấy email
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;