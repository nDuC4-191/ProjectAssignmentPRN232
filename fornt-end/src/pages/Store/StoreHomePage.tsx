import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
// Sửa import (dùng 'type')
import type { Product, ProductQuery, Category } from '../../types/product.types';

const StoreHomePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState<ProductQuery>({ pageNumber: 1, pageSize: 12 });
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // SỬA Ở ĐÂY: Không còn '.data'
                const pagedData = await productService.getProducts(filters);
                setProducts(pagedData.items);
                // TODO: setTotalPages(pagedData.totalPages);
            } catch (error) { console.error("Lỗi tải sản phẩm:", error); }
        };
        fetchProducts();
    }, [filters]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // SỬA Ở ĐÂY: Không còn '.data'
                const categoriesData = await productService.getCategories();
                setCategories(categoriesData);
            } catch (error) { console.error("Lỗi tải danh mục:", error); }
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

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Cửa Hàng Cây Cảnh</h1>
            {/* Lọc và Tìm kiếm */}
            <div className="flex gap-4 mb-6">
                <input type="text" placeholder="Tìm theo tên..." onChange={handleSearch} className="border p-2 rounded-md flex-grow" />
                <select onChange={handleCategory} className="border p-2 rounded-md">
                    <option value="">Tất cả danh mục</option>
                    {categories.map(cat => (
                        <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                    ))}
                </select>
                {/* TODO: Thêm các filter khác (Giá, Nhu cầu...) */}
            </div>

            {/* Hiển thị sản phẩm */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.productID} className="border rounded-lg shadow-sm overflow-hidden">
                        <Link to={`/products/${product.productID}`}>
                            <img src={product.imageUrl || 'https://via.placeholder.com/300'} alt={product.productName} className="w-full h-48 object-cover" />
                        </Link>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold">{product.productName}</h3>
                            <p className="text-gray-700 mt-1">{product.price.toLocaleString()} VND</p>
                            <Link to={`/products/${product.productID}`} className="text-green-600 hover:text-green-800 mt-2 inline-block">
                                Xem chi tiết
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default StoreHomePage;