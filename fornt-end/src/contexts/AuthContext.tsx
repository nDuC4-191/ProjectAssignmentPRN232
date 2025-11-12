// Path: src/contexts/AuthContext.tsx
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types/auth.types'; // (Tạo ở bước 4.1)
import api from '../services/api.service'; // Import 'api' từ service của Vinh
// TODO: (Phần của Vũ) Import auth service (ví dụ: authService.getProfile())

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token'); // Lấy 'token'
            
            if (storedToken) {
                setToken(storedToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                
                try {
                    // TODO: (Phần của Vũ)
                    // Gọi API (ví dụ: /api/auth/profile) để lấy thông tin user
                    // const { data: userData } = await authService.getProfile(); 
                    // Giả sử Vũ có 1 hàm 'getProfile'
                    // setUser(userData);
                } catch (error) {
                    console.error("Token không hợp lệ, đăng xuất:", error);
                    logout(); // Token cũ/hỏng -> xóa nó đi
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken); // Lưu 'token'
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token;

    return (
        // === DÒNG SỬA Ở ĐÂY ===
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook tùy chỉnh
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};