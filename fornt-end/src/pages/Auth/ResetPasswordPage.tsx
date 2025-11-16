// src/pages/Auth/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Kiểm tra token có tồn tại không
    if (!token) {
      setTokenValid(false);
      setError('Link không hợp lệ!');
    }
  }, [token]);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!/(?=.*[a-z])/.test(pass)) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường';
    }
    if (!/(?=.*[A-Z])/.test(pass)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }
    if (!/(?=.*\d)/.test(pass)) {
      return 'Mật khẩu phải có ít nhất 1 số';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (!token) {
      setError('Token không hợp lệ!');
      return;
    }

    setLoading(true);

    try {
      // Decode token nếu cần (trường hợp URL encode)
      const decodedToken = decodeURIComponent(token);
      
      const response = await authService.resetPassword(decodedToken, password);
      
      if (response.success) {
        setSuccess(true);
        
        // Redirect về login sau 3 giây
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Token không hợp lệ hoặc đã hết hạn!');
      }
    } catch (err: any) {
      console.error('❌ Reset password error:', err);
      setError(err.message || 'Token không hợp lệ hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  // Nếu token không hợp lệ
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Link không hợp lệ</h2>
            <p className="text-gray-600 mb-6">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
            >
              Yêu cầu link mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">🌱 PlantCare</h1>
          <p className="text-gray-600">Đặt lại mật khẩu mới</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {success ? (
            // Success State
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Thành công!</h2>
              <p className="text-gray-600 mb-4">
                Mật khẩu của bạn đã được đặt lại thành công.
              </p>
              <p className="text-sm text-gray-500">
                Đang chuyển đến trang đăng nhập...
              </p>
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto"></div>
              </div>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🔑</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu</h2>
                <p className="text-gray-600 text-sm">
                  Nhập mật khẩu mới cho tài khoản của bạn
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
                  <span className="mr-2">❌</span>
                  <span className="flex-1">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="Nhập mật khẩu mới"
                      required
                      minLength={6}
                      disabled={loading}
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
                  <p className="text-xs text-gray-500 mt-1">
                    Ít nhất 6 ký tự, có chữ hoa, chữ thường và số
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Độ mạnh mật khẩu:</p>
                    <div className="flex items-center text-xs">
                      <span className={password.length >= 6 ? 'text-green-600' : 'text-gray-400'}>
                        {password.length >= 6 ? '✓' : '○'} Ít nhất 6 ký tự
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={/(?=.*[a-z])/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                        {/(?=.*[a-z])/.test(password) ? '✓' : '○'} Có chữ thường
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={/(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                        {/(?=.*[A-Z])/.test(password) ? '✓' : '○'} Có chữ hoa
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                        {/(?=.*\d)/.test(password) ? '✓' : '○'} Có số
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    '🔐 Đặt lại mật khẩu'
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 font-semibold transition"
                >
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            🔒 Link chỉ có hiệu lực trong 30 phút
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;