// src/types/auth.types.ts

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  role: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void; // ✅ Thêm dòng này
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}