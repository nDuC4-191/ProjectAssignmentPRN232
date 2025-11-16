// src/pages/Auth/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const ResetPasswordPage: React.FC = () => {
  const { token: paramToken } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // ✅ Lấy token từ URL param HOẶC query string
  const token = paramToken || searchParams.get('token') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
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

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

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
      const response = await authService.resetPassword(token, password);
      
      if (response.success) {
        setSuccess(true);
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

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Link không hợp lệ</h2>
            <p className="text-gray-600 mb-6">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              Yêu cầu link mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            PlantCare
          </h1>
          <p className="text-gray-600 text-sm">Đặt lại mật khẩu mới</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {success ? (
            <div className="text-center animate-fade-in">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Thành công!</h2>
              <p className="text-gray-600 mb-4">
                Mật khẩu của bạn đã được đặt lại thành công.
              </p>
              <p className="text-sm text-gray-500">
                Đang chuyển đến trang đăng nhập...
              </p>
              <div className="mt-4">
                <svg className="animate-spin h-8 w-8 mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🔑</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu</h2>
                <p className="text-gray-600 text-sm">
                  Nhập mật khẩu mới cho tài khoản của bạn
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-shake">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-red-800 font-medium">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập mật khẩu mới"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ít nhất 6 ký tự, có chữ hoa, chữ thường và số
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Strength */}
                {password && (
                  <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Độ mạnh mật khẩu:</p>
                    <div className="space-y-1">
                      <div className="flex items-center text-xs">
                        <span className={`mr-2 ${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                          {password.length >= 6 ? '✓' : '○'}
                        </span>
                        <span className={password.length >= 6 ? 'text-green-600' : 'text-gray-600'}>
                          Ít nhất 6 ký tự
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <span className={`mr-2 ${/(?=.*[a-z])/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/(?=.*[a-z])/.test(password) ? '✓' : '○'}
                        </span>
                        <span className={/(?=.*[a-z])/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                          Có chữ thường
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <span className={`mr-2 ${/(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/(?=.*[A-Z])/.test(password) ? '✓' : '○'}
                        </span>
                        <span className={/(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                          Có chữ hoa
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <span className={`mr-2 ${/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/(?=.*\d)/.test(password) ? '✓' : '○'}
                        </span>
                        <span className={/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                          Có số
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Đặt lại mật khẩu
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">hoặc</span>
                </div>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 font-semibold transition-all hover:underline"
                >
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-700">
              🔒 Link chỉ có hiệu lực trong 30 phút
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2024 PlantCare. Chăm sóc cây trồng thông minh.
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;