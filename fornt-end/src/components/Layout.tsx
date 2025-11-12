// Path: src/components/Layout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
    const { cartItemCount } = useCart();
    const { isAuthenticated, user, logout, isLoading } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation (Lấy từ App.tsx của bạn và nâng cấp) */}
            <nav className="bg-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="text-2xl font-bold text-green-600 flex items-center">
                            🌱 PlantCare
                        </Link>
                        
                        <div className="flex gap-6 items-center"> {/* Thêm items-center */}
                            
                            {/* === Link của Cảnh === */}
                            <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition">
                                Cửa hàng
                            </Link>

                            {/* === Link của Vinh/Đức Anh === */}
                            {/* Chỉ hiển thị khi đã đăng nhập */}
                            {isAuthenticated && (
                                <>
                                    <Link to="/admin/products" className="text-gray-700 hover:text-green-600 font-medium transition">
                                        Admin
                                    </Link>
                                    <Link to="/my-plants" className="text-gray-700 hover:text-green-600 font-medium transition">
                                        Cây của tôi
                                    </Link>
                                    <Link to="/wiki" className="text-gray-700 hover:text-green-600 font-medium transition">
                                        Wiki
                                    </Link>
                                    <Link to="/recommendations" className="text-gray-700 hover:text-green-600 font-medium transition">
                                        Gợi ý
                                    </Link>
                                </>
                            )}

                            {/* === Icon Giỏ hàng (của Cảnh) === */}
                            <Link to="/cart" className="relative text-gray-700 hover:text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                            
                            {/* === Auth (của Vũ) === */}
                            {isLoading && <span className="text-gray-500 text-sm">...</span>}
                            {!isLoading && (
                                isAuthenticated ? (
                                    <div className="flex items-center space-x-2">
                                        <Link to="/profile" className="text-gray-700">{user?.fullName}</Link>
                                        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">(Đăng xuất)</button>
                                    </div>
                                ) : (
                                    <Link to="/login" className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">
                                        Đăng nhập
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Nội dung trang (Routes) sẽ được render ở đây */}
            <Outlet /> 
            
            {/* TODO: Thêm Footer nếu cần */}
        </div>
    );
};
export default Layout;