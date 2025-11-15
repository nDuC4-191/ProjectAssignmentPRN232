import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
// Sửa import (dùng 'type')
import type { Product, ProductQuery, Category } from '../../types/product.types';

const StoreHomePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState<ProductQuery>({ pageNumber: 1, pageSize: 12 });
    
    // useEffect này sẽ tự động chạy lại BẤT CỨ KHI NÀO state 'filters' thay đổi
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Service đã trả về .data
                const pagedData = await productService.getProducts(filters);
                setProducts(pagedData.items);
                // TODO: setTotalPages(pagedData.totalPages);
            } catch (error) { console.error("Lỗi tải sản phẩm:", error); }
        };
        fetchProducts();
    }, [filters]); // Phụ thuộc vào 'filters'

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await productService.getCategories();
                setCategories(categoriesData);
            } catch (error) { console.error("Lỗi tải danh mục:", error); }
        };
        fetchCategories();
    }, []);

    // === CÁC HÀM HANDLER CHO FILTER ===

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value, pageNumber: 1 }));
    };
    
    const handleCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = e.target.value ? parseInt(e.target.value) : undefined;
        setFilters(prev => ({ ...prev, categoryId, pageNumber: 1 }));
    };

    // === HÀM HANDLER CHO CÁC FILTER CÒN LẠI ===

    const handlePrice = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        let minPrice: number | undefined = undefined;
        let maxPrice: number | undefined = undefined;

        if (value) {
            const parts = value.split('-');
            minPrice = parts[0] ? parseInt(parts[0]) : undefined;
            maxPrice = parts[1] ? parseInt(parts[1]) : undefined;
        }
        // Cập nhật state 'filters', sẽ tự động gọi lại API
        setFilters(prev => ({ ...prev, minPrice, maxPrice, pageNumber: 1 }));
    };

    const handleDifficulty = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || undefined; // Nếu là "" (chuỗi rỗng) thì thành undefined
        setFilters(prev => ({ ...prev, difficulty: value, pageNumber: 1 }));
    };
    
    const handleLight = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || undefined;
        setFilters(prev => ({ ...prev, lightRequirement: value, pageNumber: 1 }));
    };

    const handleWater = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || undefined;
        setFilters(prev => ({ ...prev, waterRequirement: value, pageNumber: 1 }));
    };
    
    // === KẾT THÚC PHẦN HANDLER ===

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Cửa Hàng Cây Cảnh</h1>
            
            {/* Lọc và Tìm kiếm (Đã thêm Tailwind 'flex-wrap') */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <input 
                    type="text" 
                    placeholder="Tìm theo tên..." 
                    onChange={handleSearch} 
                    className="border p-2 rounded-md flex-grow min-w-[200px]" 
                />
                <select onChange={handleCategory} className="border p-2 rounded-md">
                    <option value="">Tất cả danh mục</option>
                    {categories.map(cat => (
                        <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                    ))}
                </select>

                {/* === CÁC Ô FILTER CÒN LẠI === */}

                {/* Filter Giá */}
                <select onChange={handlePrice} className="border p-2 rounded-md">
                    <option value="">Tất cả mức giá</option>
                    <option value="0-100000">Dưới 100.000 VND</option>
                    <option value="100000-300000">100.000 - 300.000 VND</option>
                    <option value="300000-99999999">Trên 300.000 VND</option>
                </select>

                {/* Filter Độ khó */}
                <select onChange={handleDifficulty} className="border p-2 rounded-md">
                    <option value="">Tất cả độ khó</option>
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                </select>

                {/* Filter Ánh sáng */}
                <select onChange={handleLight} className="border p-2 rounded-md">
                    <option value="">Tất cả ánh sáng</option>
                    <option value="Thấp">Thấp</option>
                    <option value="Vừa">Vừa</option>
                    <option value="Cao">Cao</option>
                </select>

                {/* Filter Nước */}
                <select onChange={handleWater} className="border p-2 rounded-md">
                    <option value="">Tất cả nhu cầu nước</option>
                    <option value="Ít">Ít</option>
                    <option value="Vừa">Vừa</option>
                    <option value="Nhiều">Nhiều</option>
                </select>

                {/* === KẾT THÚC PHẦN FILTER === */}
            </div>

            {/* Hiển thị sản phẩm */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.length > 0 ? (
                    products.map(product => (
                        <div key={product.productID} className="border rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                            <Link to={`/products/${product.productID}`}>
                                <img src={product.imageUrl || 'https://via.placeholder.com/300'} alt={product.productName} className="w-full h-48 object-cover" />
                            </Link>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold truncate">{product.productName}</h3>
                                <p className="text-gray-700 mt-1">{product.price.toLocaleString()} VND</p>
                                <Link to={`/products/${product.productID}`} className="text-green-600 hover:text-green-800 mt-2 inline-block text-sm font-medium">
                                    Xem chi tiết
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>
                )}
            </div>
            {/* TODO: Thêm Paging (Phân trang) */}
        </div>
    );
};
export default StoreHomePage;