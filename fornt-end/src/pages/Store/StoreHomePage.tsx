// src/pages/Store/StoreHomePage.tsx
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
    Search: '',
    CategoryId: undefined
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  // === DEBOUNCE TÌM KIẾM ===
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, Search: searchInput.trim(), pageNumber: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // === TẢI SẢN PHẨM ===
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const pagedData: PagedResult<Product> = await productService.getProducts(filters);
        setProducts(pagedData.items || []);
        setTotalItems(pagedData.totalCount || 0);
        setTotalPages(pagedData.totalPages || 0);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  // === TẢI DANH MỤC ===
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // === TÌM KIẾM ===
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  // === LỌC DANH MỤC ===
  const handleCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const categoryId = value === '' ? undefined : Number(value);
    setFilters(prev => ({ ...prev, CategoryId: categoryId, pageNumber: 1 }));
  };

  // === CHUYỂN TRANG ===
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setFilters(prev => ({ ...prev, pageNumber: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // === XỬ LÝ ẢNH ===
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400';
  };

  const getImageUrl = (product: Product): string => {
    return product.imageUrl || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400';
  };

  const currentPage = filters.pageNumber || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-6xl">🌿</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Cửa Hàng Cây Cảnh
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá <span className="font-bold text-green-600">{totalItems}</span> loại cây cảnh chất lượng cao, mang thiên nhiên vào ngôi nhà của bạn
          </p>
        </div>

        {/* Lọc và Tìm kiếm */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-5xl mx-auto">
          <div className="relative flex-grow">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm cây cảnh yêu thích của bạn..." 
              value={searchInput}
              onChange={handleSearchInput}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white shadow-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all outline-none"
            />
          </div>
          <select 
            value={filters.CategoryId ?? ''}
            onChange={handleCategory} 
            className="px-6 py-4 rounded-2xl border-2 border-gray-200 bg-white md:w-64 shadow-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all outline-none font-medium text-gray-700"
          >
            <option value="">📚 Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
              <span className="absolute inset-0 flex items-center justify-center text-2xl">🌱</span>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải sản phẩm...</p>
          </div>
        ) : (
          <>
            {/* Không có sản phẩm */}
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
                {/* Danh sách sản phẩm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map(product => (
                    <div 
                      key={product.productId}
                      className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 hover:-translate-y-2"
                    >
                      <Link to={`/products/${product.productId}`}>
                        <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                          <img 
                            src={getImageUrl(product)}
                            alt={product.productName} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={handleImageError}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {product.stock === 0 && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                              ❌ Hết hàng
                            </div>
                          )}
                          {product.stock > 0 && product.stock <= 5 && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse">
                              ⚡ Chỉ còn {product.stock}
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="p-6">
                        <Link to={`/products/${product.productId}`}>
                          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors line-clamp-2 min-h-[56px]">
                            {product.productName}
                          </h3>
                        </Link>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.difficulty && (
                            <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-3 py-1.5 rounded-full font-semibold border border-blue-200">
                              📊 {product.difficulty}
                            </span>
                          )}
                          {product.waterRequirement && (
                            <span className="text-xs bg-gradient-to-r from-cyan-100 to-cyan-50 text-cyan-800 px-3 py-1.5 rounded-full font-semibold border border-cyan-200">
                              💧 {product.waterRequirement}
                            </span>
                          )}
                          {product.lightRequirement && (
                            <span className="text-xs bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 px-3 py-1.5 rounded-full font-semibold border border-yellow-200">
                              ☀️ {product.lightRequirement}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {product.price.toLocaleString('vi-VN')}₫
                          </p>
                          <Link 
                            to={`/products/${product.productId}`}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2.5 rounded-full transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Xem ngay →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-16">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-5 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-green-50 hover:border-green-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                      ← Trước
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-5 py-3 rounded-xl font-bold transition-all shadow-sm ${
                              pageNum === currentPage
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-110'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-5 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-green-50 hover:border-green-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
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
    </div>
  );
};

export default StoreHomePage;