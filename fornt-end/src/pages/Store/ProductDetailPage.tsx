import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../../services/product.service';
// Sửa import (dùng 'type')
import type { Product, Feedback } from '../../types/product.types';
import { useCart } from '../../contexts/CartContext';

const ProductDetailPageStore: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [quantity, setQuantity] = useState(1);
    const { addItemToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                // SỬA Ở ĐÂY:
                const productData = await productService.getProductById(parseInt(id));
                setProduct(productData);
                
                // SỬA Ở ĐÂY:
                const feedbackData = await productService.getFeedback(parseInt(id));
                setFeedback(feedbackData);
            } catch (error) { console.error("Lỗi tải chi tiết:", error); }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addItemToCart({ productId: product.productID, quantity: quantity });
            alert('Đã thêm vào giỏ hàng!');
        }
    };

    if (!product) return <p>Đang tải...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <img src={product.imageUrl || 'https://via.placeholder.com/500'} alt={product.productName} className="w-full rounded-lg shadow-md" />
            </div>
            <div>
                <h1 className="text-4xl font-bold">{product.productName}</h1>
                <p className="text-3xl text-green-700 my-4">{product.price.toLocaleString()} VND</p>
                
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="flex items-center gap-4 my-6">
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                        className="w-20 border p-2 rounded-md text-center"
                        min="1"
                        max={product.stock}
                    />
                    <button 
                        onClick={handleAddToCart}
                        className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400"
                        disabled={product.stock <= 0}
                    >
                        {product.stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                    </button>
                </div>
                <p className="text-sm text-gray-500">Còn lại: {product.stock} sản phẩm</p>
                
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Đánh giá sản phẩm</h2>
                    {feedback.length > 0 ? (
                        <div className="space-y-4">
                            {feedback.map(fb => (
                                <div key={fb.feedbackId} className="border-t pt-4">
                                    <p className="font-semibold">{fb.userName}</p>
                                    <p className="text-gray-600 text-sm">{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ''}</p>
                                    <p className="mt-2">{fb.message}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Chưa có đánh giá nào.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ProductDetailPageStore;