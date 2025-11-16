// src/contexts/AuthContext.tsx
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api.service';

// ============================================================
// INTERFACES - Định nghĩa trực tiếp trong file
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

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

// ============================================================
// CREATE CONTEXT
// ============================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// AUTH PROVIDER COMPONENT
// ============================================================
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ===================== INITIALIZE AUTH FROM LOCALSTORAGE =====================
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const userData: User = JSON.parse(storedUser);
          
          // Normalize role về lowercase
          const normalizedUser: User = {
            ...userData,
            role: userData.role?.toLowerCase() || 'customer'
          };
          
          setToken(storedToken);
          setUser(normalizedUser);
          
          // Set Authorization header cho tất cả request
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          console.log('✅ Auth initialized:', {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            role: normalizedUser.role
          });
        } else {
          console.log('ℹ️ No stored auth data found');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Clear invalid data
        await logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================== LOGIN FUNCTION =====================
  const login = useCallback((newToken: string, newUser: User): void => {
    try {
      // Normalize role về lowercase
      const normalizedUser: User = {
        ...newUser,
        role: newUser.role?.toLowerCase() || 'customer'
      };

      // Save to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      // Set Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Update state
      setToken(newToken);
      setUser(normalizedUser);
      
      console.log('✅ Login success:', {
        userId: normalizedUser.userId,
        email: normalizedUser.email,
        role: normalizedUser.role
      });
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }, []);

  // ===================== LOGOUT FUNCTION =====================
  const logout = useCallback((): void => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear Authorization header
      delete api.defaults.headers.common['Authorization'];
      
      // Clear state
      setToken(null);
      setUser(null);
      
      console.log('✅ Logout success');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }, []);

  // ===================== UPDATE USER FUNCTION =====================
  const updateUser = useCallback((updatedData: Partial<User>): void => {
    if (!user) {
      console.warn('⚠️ Cannot update user: No user logged in');
      return;
    }

    try {
      const updatedUser: User = {
        ...user,
        ...updatedData
      };

      // Update state
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('✅ User updated:', {
        userId: updatedUser.userId,
        email: updatedUser.email
      });
    } catch (error) {
      console.error('❌ Update user error:', error);
    }
  }, [user]);

  // ===================== REFRESH USER FROM API =====================
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!token) {
      console.warn('⚠️ Cannot refresh user: No token found');
      return;
    }

    try {
      console.log('🔄 Refreshing user data from API...');
      
      const response = await api.get('/authentication/me');
      
      if (response.data.success && response.data.user) {
        const freshUser: User = response.data.user;
        
        // Normalize role
        const normalizedUser: User = {
          ...freshUser,
          role: freshUser.role?.toLowerCase() || 'customer'
        };
        
        // Update state
        setUser(normalizedUser);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        
        console.log('✅ User data refreshed:', normalizedUser.email);
      }
    } catch (error: any) {
      console.error('❌ Refresh user error:', error);
      
      // If token is invalid, logout
      if (error.response?.status === 401) {
        console.warn('⚠️ Token expired, logging out...');
        logout();
      }
    }
  }, [token, logout]);

  // ===================== COMPUTED VALUES =====================
  const isAuthenticated = !!token && !!user;

  // ===================== CONTEXT VALUE =====================
  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// CUSTOM HOOK TO USE AUTH CONTEXT
// ============================================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// ============================================================
// UTILITY HOOKS
// ============================================================

// Hook để check role
export const useRole = (): string | null => {
  const { user } = useAuth();
  return user?.role || null;
};

// Hook để check admin
export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.role?.toLowerCase() === 'admin';
};

// Hook để check customer
export const useIsCustomer = (): boolean => {
  const { user } = useAuth();
  return user?.role?.toLowerCase() === 'customer';
};

// Hook để lấy user ID
export const useUserId = (): number | null => {
  const { user } = useAuth();
  return user?.userId || null;
};

// ============================================================
// EXPORTS
// ============================================================
export default AuthContext;