// src/contexts/AuthContext.tsx
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types/auth.types';
import api from '../services/api.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (storedToken && storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(userData);
                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                } catch (error) {
                    console.error("Lỗi parse user data:", error);
                    logout();
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        const normalizedUser = {
            ...newUser,
            role: newUser.role?.toLowerCase() || 'customer'
        };

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(normalizedUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    // ✅ Thêm hàm updateUser để cập nhật thông tin user
    const updateUser = (updatedData: Partial<User>) => {
        if (!user) return;

        const updatedUser = {
            ...user,
            ...updatedData
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            isAuthenticated, 
            login, 
            logout, 
            updateUser, // ✅ Export updateUser
            isLoading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};