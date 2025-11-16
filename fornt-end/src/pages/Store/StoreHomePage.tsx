import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import type { Product, ProductQuery, Category, PagedResult } from '../../types/product.types';

const StoreHomePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState<ProductQuery>({ 
        pageNumber: 1, 
        pageSize: 12,
        search: '',
        categoryId: undefined
    });
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const pagedData: PagedResult<Product> = await productService.getProducts(filters);
                setProducts(pagedData.items || []);
                setTotalItems(pagedData.totalItems || 0);
                setTotalPages(pagedData.totalPages || 0);
            } catch (error) {
                console.error("Lỗi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [filters]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await productService.getCategories();
                setCategories(categoriesData);
            } catch (error) {
                console.error("Lỗi tải danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value, pageNumber: 1 }));
    };
    
    const handleCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = e.target.value ? parseInt(e.target.value) : undefined;
        setFilters(prev => ({ ...prev, categoryId, pageNumber: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, pageNumber: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Helper function để xử lý ảnh lỗi
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400';
    };

    // Helper function để lấy URL ảnh
    const getImageUrl = (product: Product): string => {
        return product.imageUrl || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">🌿 Cửa Hàng Cây Cảnh</h1>
                <p className="text-gray-600">
                    Khám phá hơn <strong>{totalItems}</strong> loại cây cảnh chất lượng cao
                </p>
            </div>

            {/* Lọc và Tìm kiếm */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-lg shadow-md">
                <input 
                    type="text" 
                    placeholder="🔍 Tìm kiếm cây cảnh..." 
                    value={filters.search || ''}
                    onChange={handleSearch} 
                    className="border border-gray-300 p-3 rounded-lg flex-grow focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <select 
                    value={filters.categoryId || ''}
                    onChange={handleCategory} 
                    className="border border-gray-300 p-3 rounded-lg md:w-64 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                    <option value="">📂 Tất cả danh mục</option>
                    {categories.map(cat => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                </div>
            ) : (
                <>
                    {/* Hiển thị sản phẩm */}
                    {products.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🌱</div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                Không tìm thấy sản phẩm
                            </h3>
                            <p className="text-gray-600">Thử điều chỉnh bộ lọc của bạn</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map(product => (
                                    <div 
                                        key={product.productID} 
                                        className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <Link to={`/products/${product.productID}`}>
                                            <div className="relative h-56 bg-gray-100 overflow-hidden">
                                                <img 
                                                    src={getImageUrl(product)}
                                                    alt={product.productName} 
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                    onError={handleImageError}
                                                    loading="lazy"
                                                />
                                                {/* Stock badge */}
                                                {product.stock === 0 && (
                                                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                        Hết hàng
                                                    </div>
                                                )}
                                                {product.stock > 0 && product.stock <= 5 && (
                                                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                        Chỉ còn {product.stock}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                        
                                        <div className="p-4">
                                            <Link to={`/products/${product.productID}`}>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-green-600 transition-colors line-clamp-2">
                                                    {product.productName}
                                                </h3>
                                            </Link>
                                            
                                            {/* Product info */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {product.difficulty && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {product.difficulty}
                                                    </span>
                                                )}
                                                {product.waterRequirement && (
                                                    <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                                                        💧 {product.waterRequirement}
                                                    </span>
                                                )}
                                                {product.lightRequirement && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                        ☀️ {product.lightRequirement}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between">
                                                <p className="text-xl font-bold text-green-600">
                                                    {product.price.toLocaleString('vi-VN')}₫
                                                </p>
                                                <Link 
                                                    to={`/products/${product.productID}`} 
                                                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    Chi tiết
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-12">
                                    <button
                                        onClick={() => handlePageChange(filters.pageNumber - 1)}
                                        disabled={filters.pageNumber === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        ← Trước
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (filters.pageNumber <= 3) {
                                            pageNum = i + 1;
                                        } else if (filters.pageNumber >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = filters.pageNumber - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                                    pageNum === filters.pageNumber
                                                        ? 'bg-green-600 text-white shadow-md'
                                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(filters.pageNumber + 1)}
                                        disabled={filters.pageNumber === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Sau →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default StoreHomePage;