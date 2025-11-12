// Path: src/types/auth.types.ts

// (Dựa trên Model User.cs)
export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
}

// Định nghĩa hình dạng của AuthContext
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean; 
}