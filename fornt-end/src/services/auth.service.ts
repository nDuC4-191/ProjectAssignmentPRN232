// src/services/auth.service.ts
import api from './api.service'; // hoặc thử: import api from '@/services/api.service';

// ============================================================
// INTERFACES
// ============================================================
interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  userId: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  code?: string;
  user?: User;
}

// ============================================================
// AUTH SERVICE
// ============================================================
export const authService = {
  // Đăng ký
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/authentication/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone || '',
        address: data.address || '',
      });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      console.error('Register error:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  // Đăng nhập
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/authentication/login', data);
      
      if (response.data.success && response.data.token) {
        // ✅ Lưu token
        localStorage.setItem('token', response.data.token);
        
        // ✅ Lưu thông tin user
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      console.error('Login error:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  // Quên mật khẩu - Gửi email
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      console.log('📧 Sending forgot password request for:', email);
      
      const response = await api.post('/authentication/forgot-password', {
        email,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      
      // ✅ Backend luôn trả 200 OK để tránh email enumeration
      // Chỉ hiển thị lỗi chung nếu có lỗi thật sự (500, network, etc.)
      const errorMsg = error.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại!';
      throw new Error(errorMsg);
    }
  },

  // Reset mật khẩu với token
  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔑 Resetting password with token');
      
      const response = await api.post('/authentication/reset-password', {
        token,
        newPassword: password,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Link đã hết hạn hoặc không hợp lệ!');
      }
      
      const errorMsg = error.response?.data?.message || 'Đặt lại mật khẩu thất bại!';
      throw new Error(errorMsg);
    }
  },

  // Xác minh email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      console.log('🔍 Verifying email with token:', token);
      
      const response = await api.get('/authentication/verify-email', {
        params: { token },
      });
      
      console.log('✅ Verify response:', response.data);
      
      if (typeof response.data.success !== 'boolean') {
        console.warn('⚠️ Response missing success field:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Verify email error:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.success === false) {
          throw new Error(errorData.message || 'Xác minh email thất bại!');
        }
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Hết thời gian chờ. Vui lòng thử lại!');
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối!');
      }
      
      const errorMsg = error.response?.data?.message || 'Xác minh email thất bại!';
      throw new Error(errorMsg);
    }
  },

  // Gửi lại email xác minh
  async resendVerifyEmail(email: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/authentication/resend-verify', {
        email,
      });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Gửi lại email thất bại!';
      console.error('Resend verify error:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  // ✅ Đổi mật khẩu (khi đã đăng nhập) - FIXED
  async changePassword(currentPassword: string, newPassword: string, confirmNewPassword?: string): Promise<AuthResponse> {
    try {
      const payload: any = {
        currentPassword,  // ✅ Đúng tên field với backend
        newPassword,
      };
      
      // ✅ Thêm confirmNewPassword nếu có (optional)
      if (confirmNewPassword) {
        payload.confirmNewPassword = confirmNewPassword;
      }
      
      const response = await api.put('/authentication/change-password', payload);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Change password error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Mật khẩu hiện tại không đúng!');
      }
      
      const errorMsg = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
      throw new Error(errorMsg);
    }
  },

  // ✅ Lấy thông tin user hiện tại từ API
  async fetchCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/authentication/me');
      
      if (response.data.success && response.data.user) {
        // Cập nhật localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      throw new Error('Không thể lấy thông tin user');
    } catch (error: any) {
      console.error('❌ Fetch current user error:', error);
      
      if (error.response?.status === 401) {
        // Token không hợp lệ, logout
        this.logout();
      }
      
      const errorMsg = error.response?.data?.message || 'Không thể lấy thông tin người dùng!';
      throw new Error(errorMsg);
    }
  },

  // Đăng xuất
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Lấy token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Lấy thông tin user từ localStorage
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Kiểm tra đã đăng nhập
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // ✅ Kiểm tra role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  },

  // ✅ Kiểm tra có phải admin
  isAdmin(): boolean {
    return this.hasRole('Admin');
  },
};

export default authService;