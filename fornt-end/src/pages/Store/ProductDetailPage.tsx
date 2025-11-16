// src/pages/Store/ProductDetailPageStore.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import type { Product, Feedback } from '../../types/product.types';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetailPageStore: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useCart();
  const { user } = useAuth();

  // === FETCH PRODUCT & FEEDBACK ===
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError('');

      try {
        const productId = parseInt(id, 10);
        const [productData, feedbackData] = await Promise.all([
          productService.getProductById(productId),
          productService.getFeedback(productId),
        ]);

        setProduct(productData);
        setFeedback(feedbackData || []);
      } catch (err: any) {
        console.error('Lỗi tải chi tiết sản phẩm:', err);
        setError(err.message || 'Không thể tải sản phẩm. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // === ADD TO CART ===
  const handleAddToCart = async () => {
    if (!product || !user) return;

    try {
      await addToCart({
        id: Date.now(),
        productId: product.productID,
        productName: product.productName,
        imageUrl: product.imageUrl,   // ĐÚNG: imageUrl (theo type CartItem)
        price: product.price,
        quantity,
      });
      alert('Đã thêm vào giỏ hàng!');
    } catch (err: any) {
      console.error('Lỗi thêm vào giỏ:', err);
      alert(err.message || 'Không thể thêm vào giỏ hàng!');
    }
  };

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-lg">Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  // === ERROR STATE ===
  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="text-6xl mb-4">Error</div>
        <p className="text-xl text-red-600 mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
        <Link
          to="/store"
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/" className="text-gray-500 hover:text-green-600">Trang chủ</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to="/store" className="text-gray-500 hover:text-green-600">Cửa hàng</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-800">{product.productName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative">
          <img
            src={product.imageUrl || '/images/placeholder-plant.jpg'}
            alt={product.productName}
            className="w-full h-96 md:h-full object-cover rounded-xl shadow-lg"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder-plant.jpg';
            }}
            loading="lazy"
          />
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-xl">
              <span className="text-white text-3xl font-bold">HẾT HÀNG</span>
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              Chỉ còn {product.stock}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">{product.productName}</h1>

          <div className="flex items-center gap-3 mb-4">
            <p className="text-3xl font-bold text-green-600">
              {product.price.toLocaleString('vi-VN')}₫
            </p>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-6">
            {product.difficulty && (
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {product.difficulty}
              </span>
            )}
            {product.lightRequirement && (
              <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Sun {product.lightRequirement}
              </span>
            )}
            {product.waterRequirement && (
              <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                Water {product.waterRequirement}
              </span>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center py-2.5 border-x border-gray-300 focus:outline-none"
                min="1"
                max={product.stock}
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || !user}
              className={`flex-1 py-3.5 rounded-lg font-bold text-lg transition shadow-md ${
                product.stock > 0 && user
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? (user ? 'Thêm vào giỏ hàng' : 'Đăng nhập để mua') : 'Hết hàng'}
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-8">
            <strong>Kho:</strong> {product.stock > 0 ? `${product.stock} sản phẩm sẵn có` : 'Hết hàng'}
          </p>

          {/* Feedback Section */}
          <div className="mt-10 border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá từ khách hàng</h2>

            {feedback.length > 0 ? (
              <div className="space-y-6">
                {feedback.map((fb) => (
                  <div key={fb.feedbackId} className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-800">{fb.userName}</p>
                      <p className="text-sm text-gray-500">
                        {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                      </p>
                    </div>
                    <p className="text-gray-700">{fb.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">Chưa có đánh giá nào.</p>
                <p className="text-sm text-gray-400 mt-2">
                  {user ? 'Hãy là người đầu tiên đánh giá!' : 'Đăng nhập để đánh giá'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back to Store */}
      <div className="mt-12 text-center">
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
        >
          Back to Store Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
};

export default ProductDetailPageStore;