// src/services/auth.service.ts
import api from '../services/api.service';
import type { AxiosResponse } from 'axios';

// ============================================================
// INTERFACES
// ============================================================
export interface User {
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

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  code?: string;
  user?: User;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface VerifyEmailData {
  token: string;
}

// ============================================================
// AUTH SERVICE
// ============================================================
class AuthService {
  // ===================== ĐĂNG KÝ =====================
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/authentication/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone || '',
        address: data.address || '',
      });
      
      console.log('✅ Register success');
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      console.error('❌ Register error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== ĐĂNG NHẬP =====================
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/authentication/login', data);
      
      if (response.data.success && response.data.token) {
        // Lưu token
        localStorage.setItem('token', response.data.token);
        
        // Lưu thông tin user
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        console.log('✅ Login success:', response.data.user?.email);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      console.error('❌ Login error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== QUÊN MẬT KHẨU =====================
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      console.log('📧 Sending forgot password request for:', email);
      
      const response: AxiosResponse<AuthResponse> = await api.post('/authentication/forgot-password', {
        email,
      });
      
      console.log('✅ Forgot password email sent');
      return response.data;
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      
      // Backend luôn trả 200 để tránh email enumeration
      const errorMsg = error.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại!';
      throw new Error(errorMsg);
    }
  }

  // ===================== RESET MẬT KHẨU =====================
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      console.log('🔑 Resetting password with token');
      
      const response: AxiosResponse<AuthResponse> = await api.post('/authentication/reset-password', {
        token,
        newPassword,
      });
      
      console.log('✅ Password reset successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Link đã hết hạn hoặc không hợp lệ!');
      }
      
      const errorMsg = error.response?.data?.message || 'Đặt lại mật khẩu thất bại!';
      throw new Error(errorMsg);
    }
  }

  // ===================== XÁC MINH EMAIL =====================
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      console.log('🔍 Verifying email with token');
      
      const response: AxiosResponse<AuthResponse> = await api.get('/authentication/verify-email', {
        params: { token },
      });
      
      console.log('✅ Email verified successfully');
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
  }

  // ===================== GỬI LẠI EMAIL XÁC MINH =====================
  async resendVerifyEmail(email: string): Promise<AuthResponse> {
    try {
      console.log('📧 Resending verification email to:', email);
      
      const response: AxiosResponse<AuthResponse> = await api.post('/authentication/resend-verify', {
        email,
      });
      
      console.log('✅ Verification email resent');
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Gửi lại email thất bại!';
      console.error('❌ Resend verify error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== ĐỔI MẬT KHẨU =====================
  async changePassword(
    currentPassword: string, 
    newPassword: string, 
    confirmNewPassword?: string
  ): Promise<AuthResponse> {
    try {
      const payload: ChangePasswordData = {
        currentPassword,
        newPassword,
      };
      
      if (confirmNewPassword) {
        payload.confirmNewPassword = confirmNewPassword;
      }
      
      const response: AxiosResponse<AuthResponse> = await api.put('/authentication/change-password', payload);
      
      console.log('✅ Password changed successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Change password error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Mật khẩu hiện tại không đúng!');
      }
      
      const errorMsg = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
      throw new Error(errorMsg);
    }
  }

  // ===================== LẤY THÔNG TIN USER TỪ API =====================
  async fetchCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<{ success: boolean; user: User }> = await api.get('/authentication/me');
      
      if (response.data.success && response.data.user) {
        // Cập nhật localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ User info fetched:', response.data.user.email);
        return response.data.user;
      }
      
      throw new Error('Không thể lấy thông tin user');
    } catch (error: any) {
      console.error('❌ Fetch current user error:', error);
      
      // Nếu token hết hạn, logout
      if (error.response?.status === 401) {
        this.logout();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      
      const errorMsg = error.response?.data?.message || 'Không thể lấy thông tin người dùng!';
      throw new Error(errorMsg);
    }
  }

  // ===================== ĐĂNG XUẤT =====================
  logout(): void {
    try {
      // Xóa token và user khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('✅ Logged out successfully');
      
      // Redirect đến trang login
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  // ===================== LẤY TOKEN =====================
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ===================== SET TOKEN =====================
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // ===================== REMOVE TOKEN =====================
  removeToken(): void {
    localStorage.removeItem('token');
  }

  // ===================== LẤY THÔNG TIN USER TỪ LOCALSTORAGE =====================
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const user: User = JSON.parse(userStr);
      return user;
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      return null;
    }
  }

  // ===================== SET USER =====================
  setCurrentUser(user: User): void {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ User info saved');
    } catch (error) {
      console.error('❌ Error saving user data:', error);
    }
  }

  // ===================== REMOVE USER =====================
  removeCurrentUser(): void {
    localStorage.removeItem('user');
  }

  // ===================== KIỂM TRA ĐÃ ĐĂNG NHẬP =====================
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // ===================== KIỂM TRA ROLE =====================
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // So sánh role (case-insensitive)
    return user.role.toLowerCase() === role.toLowerCase();
  }

  // ===================== KIỂM TRA ADMIN =====================
  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  // ===================== KIỂM TRA CUSTOMER =====================
  isCustomer(): boolean {
    return this.hasRole('Customer');
  }

  // ===================== KIỂM TRA STAFF =====================
  isStaff(): boolean {
    return this.hasRole('Staff');
  }

  // ===================== LẤY ROLE =====================
  getRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  // ===================== LẤY USER ID =====================
  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.userId || null;
  }

  // ===================== LẤY EMAIL =====================
  getEmail(): string | null {
    const user = this.getCurrentUser();
    return user?.email || null;
  }

  // ===================== CẬP NHẬT THÔNG TIN USER TRONG LOCALSTORAGE =====================
  updateUserLocal(updatedData: Partial<User>): void {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.warn('⚠️ No user found to update');
        return;
      }

      const updatedUser: User = {
        ...currentUser,
        ...updatedData,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ User info updated locally');
    } catch (error) {
      console.error('❌ Update user local error:', error);
    }
  }

  // ===================== XÓA TẤT CẢ DỮ LIỆU AUTH =====================
  clearAuth(): void {
    try {
      this.removeToken();
      this.removeCurrentUser();
      console.log('✅ Auth data cleared');
    } catch (error) {
      console.error('❌ Clear auth error:', error);
    }
  }

  // ===================== VALIDATE TOKEN =====================
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decode JWT token để check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < exp;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  }
}

// ===================== EXPORT SINGLETON INSTANCE =====================
const authService = new AuthService();
export default authService;
export { authService };