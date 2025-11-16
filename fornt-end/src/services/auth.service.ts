// src/services/auth.service.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5239';

// Log để debug
console.log('=== AUTH SERVICE CONFIG ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('API_URL used:', API_URL);

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor để log
apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('🚀 API Request:', config.method?.toUpperCase(), fullUrl);
    if (config.params) {
      console.log('   Params:', config.params);
    }
    return config;
  },
  (error) => {
    console.error('🚨 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

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

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  code?: string; // Thêm để handle TOKEN_EXPIRED
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/authentication/register', {
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

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/authentication/login', data);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      console.error('Login error:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      console.log('🔍 Verifying email with token:', token);
      
      const response = await apiClient.get('/api/authentication/verify-email', {
        params: { token },
      });
      
      console.log('✅ Verify response:', response.data);
      
      // Kiểm tra response có đúng format không
      if (typeof response.data.success !== 'boolean') {
        console.warn('⚠️ Response missing success field:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Verify email error:', error);
      
      // Xử lý chi tiết hơn
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Nếu backend trả về format chuẩn
        if (errorData.success === false) {
          throw new Error(errorData.message || 'Xác minh email thất bại!');
        }
      }
      
      // Lỗi network hoặc timeout
      if (error.code === 'ECONNABORTED') {
        throw new Error('Hết thời gian chờ. Vui lòng thử lại!');
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối!');
      }
      
      // Default error
      const errorMsg = error.response?.data?.message || 'Xác minh email thất bại!';
      throw new Error(errorMsg);
    }
  },

  async resendVerifyEmail(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/authentication/resend-verify', {
        email,
      });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Gửi lại email thất bại!';
      console.error('Resend verify error:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};