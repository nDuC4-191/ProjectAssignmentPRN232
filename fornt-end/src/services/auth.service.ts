// src/services/auth.service.ts
import api from './api.service';
import type { AxiosResponse } from 'axios';

// ============================================================
// INTERFACES – ĐÃ EXPORT
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

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  code?: string;
  user?: User;
}

// ============================================================
// AUTH SERVICE – SINGLETON CLASS
// ============================================================
class AuthService {
  private static instance: AuthService;

  private constructor() {
    // Private để đảm bảo singleton
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ===================== ĐĂNG KÝ =====================
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/authentication/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone ?? '',
        address: data.address ?? '',
      });

      if (response.data.success) {
        console.log('Register success');
      }

      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      console.error('Register error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== ĐĂNG NHẬP =====================
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/authentication/login', data);

      if (response.data.success && response.data.token) {
        this.setToken(response.data.token);
        if (response.data.user) {
          this.setCurrentUser(response.data.user);
        }
        console.log('Login success:', response.data.user?.email);
      }

      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
      console.error('Login error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== QUÊN MẬT KHẨU =====================
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/authentication/forgot-password', { email });
      console.log('Forgot password request sent');
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Gửi yêu cầu thất bại!';
      console.error('Forgot password error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== RESET MẬT KHẨU =====================
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/authentication/reset-password', {
        token,
        newPassword,
      });
      console.log('Password reset successful');
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.status === 400
        ? 'Link đã hết hạn hoặc không hợp lệ!'
        : (error.response?.data?.message || 'Đặt lại mật khẩu thất bại!');
      console.error('Reset password error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== XÁC MINH EMAIL =====================
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.get('/authentication/verify-email', {
        params: { token },
      });
      console.log('Email verified');
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Xác minh email thất bại!';
      console.error('Verify email error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== GỬI LẠI EMAIL XÁC MINH =====================
  async resendVerifyEmail(email: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/authentication/resend-verify', { email });
      console.log('Verification email resent');
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Gửi lại email thất bại!';
      console.error('Resend verify error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== ĐỔI MẬT KHẨU =====================
  async changePassword(currentPassword: string, newPassword: string, confirmNewPassword?: string): Promise<AuthResponse> {
    try {
      const payload: ChangePasswordData = { currentPassword, newPassword };
      if (confirmNewPassword) payload.confirmNewPassword = confirmNewPassword;

      const response: AxiosResponse<AuthResponse> = await api.put('/authentication/change-password', payload);
      console.log('Password changed');
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.status === 401
        ? 'Mật khẩu hiện tại không đúng!'
        : (error.response?.data?.message || 'Đổi mật khẩu thất bại!');
      console.error('Change password error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== LẤY USER TỪ API =====================
  async fetchCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<{ success: boolean; user: User }> = await api.get('/authentication/me');

      if (response.data.success && response.data.user) {
        this.setCurrentUser(response.data.user);
        console.log('User fetched:', response.data.user.email);
        return response.data.user;
      }

      throw new Error('Không thể lấy thông tin người dùng');
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logout();
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      }
      const errorMsg = error.response?.data?.message || 'Lấy thông tin thất bại!';
      console.error('Fetch user error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ===================== ĐĂNG XUẤT =====================
  logout(): void {
    this.clearAuth();
    console.log('Logged out');
    window.location.href = '/login';
  }

  // ===================== TOKEN & USER STORAGE =====================
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) as User : null;
    } catch {
      return null;
    }
  }

  removeCurrentUser(): void {
    localStorage.removeItem('user');
  }

  clearAuth(): void {
    this.removeToken();
    this.removeCurrentUser();
  }

  // ===================== AUTH STATUS =====================
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user && this.isTokenValid());
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < (payload.exp * 1000);
    } catch {
      return false;
    }
  }

  // ===================== ROLE CHECKS =====================
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role.toLowerCase() === role.toLowerCase();
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isCustomer(): boolean {
    return this.hasRole('Customer');
  }

  isStaff(): boolean {
    return this.hasRole('Staff');
  }

  getRole(): string | null {
    return this.getCurrentUser()?.role || null;
  }

  getUserId(): number | null {
    return this.getCurrentUser()?.userId || null;
  }

  getEmail(): string | null {
    return this.getCurrentUser()?.email || null;
  }

  // ===================== CẬP NHẬT USER LOCAL =====================
  updateUserLocal(updatedData: Partial<User>): void {
    const current = this.getCurrentUser();
    if (!current) return;

    const updated: User = { ...current, ...updatedData };
    this.setCurrentUser(updated);
    console.log('User updated locally');
  }
}

// ===================== EXPORT SINGLETON =====================
const authService = AuthService.getInstance();
export default authService;
export { authService };