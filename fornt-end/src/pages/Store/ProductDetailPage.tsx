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
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [checkingReviewPermission, setCheckingReviewPermission] = useState(false);

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

  // === CHECK REVIEW PERMISSION ===
  useEffect(() => {
    const checkReviewPermission = async () => {
      if (!user || !product) {
        setCanReview(false);
        return;
      }

      setCheckingReviewPermission(true);
      try {
        const token = localStorage.getItem('token');
        
        console.log('🔍 Checking review permission');
        console.log('🔍 Product ID:', product.productId);
        
        // Lấy lịch sử đơn hàng của user
        const response = await fetch(`http://localhost:5239/api/Orders/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setCanReview(false);
          return;
        }

        const result = await response.json();
        const orders = result.data || result || [];
        
        console.log('📦 Orders found:', orders.length);
        console.log('📦 Orders:', orders);
        
        // Kiểm tra xem user có đơn hàng nào chứa sản phẩm này và đã hoàn thành chưa
        let hasCompletedOrder = false;
        
        for (const order of orders) {
          if (order.status === 'Completed') {
            console.log(`🔍 Checking completed order: ${order.orderId}`);
            
            // Lấy chi tiết đơn hàng để kiểm tra sản phẩm
            const detailResponse = await fetch(`http://localhost:5239/api/Orders/${order.orderId}/details`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            console.log(`📡 Detail response status for order ${order.orderId}:`, detailResponse.status);
            
            if (detailResponse.ok) {
              const result = await detailResponse.json();
              const orderDetail = result.data || result;
              
              console.log(`📋 Order ${order.orderId} FULL details:`, JSON.stringify(orderDetail, null, 2));
              
              // Tìm danh sách items - có thể là items, orderDetails, orderItems
              const items = orderDetail.items || orderDetail.orderDetails || orderDetail.orderItems || orderDetail.products || [];
              
              console.log(`  📦 Items found in order:`, items);
              console.log(`  📦 Items count:`, items.length);
              
              // Kiểm tra xem đơn hàng có chứa sản phẩm này không
              const hasProduct = items.some((item: any) => {
                const itemProductId = item.productId || item.productID || item.ProductId || item.ProductID;
                const targetProductId = product.productId || (product as any).productID;
                console.log(`  🔍 Comparing - Item productId: ${itemProductId}, Target: ${targetProductId}, Match: ${itemProductId === targetProductId}`);
                return itemProductId === targetProductId;
              });
              
              console.log(`  ✅ Has product in this order: ${hasProduct}`);
              
              if (hasProduct) {
                hasCompletedOrder = true;
                break;
              }
            } else {
              console.error(`❌ Failed to fetch order ${order.orderId} details:`, detailResponse.statusText);
            }
          }
        }
        
        console.log('🎯 Final result - Can review:', hasCompletedOrder);
        setCanReview(hasCompletedOrder);
      } catch (err) {
        console.error('Lỗi kiểm tra quyền đánh giá:', err);
        setCanReview(false);
      } finally {
        setCheckingReviewPermission(false);
      }
    };

    checkReviewPermission();
  }, [user, product]);

  // === ADD TO CART ===
  const handleAddToCart = async () => {
    if (!product || !user) return;

    try {
      await addToCart({
        productId: product.productId || (product as any).productID,
        productName: product.productName,
        imageUrl: product.imageUrl,
        price: product.price,
        quantity,
      });
      alert('Đã thêm vào giỏ hàng!');
    } catch (err: any) {
      console.error('Lỗi thêm vào giỏ:', err);
      alert(err.message || 'Không thể thêm vào giỏ hàng!');
    }
  };

  // === SUBMIT FEEDBACK ===
  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá!');
      return;
    }

    if (!canReview) {
      alert('Bạn cần mua và nhận sản phẩm này thành công trước khi có thể đánh giá!');
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackSuccess(false);

    try {
      const token = localStorage.getItem('token');
      
      // Tìm orderId của đơn hàng Completed có chứa sản phẩm này
      let completedOrderId = null;
      const ordersResponse = await fetch(`http://localhost:5239/api/Orders/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (ordersResponse.ok) {
        const result = await ordersResponse.json();
        const orders = result.data || result || [];
        
        for (const order of orders) {
          if (order.status === 'Completed') {
            const detailResponse = await fetch(`http://localhost:5239/api/Orders/${order.orderId}/details`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (detailResponse.ok) {
              const detailResult = await detailResponse.json();
              const orderDetail = detailResult.data || detailResult;
              
              // Tìm danh sách items từ nhiều tên field có thể có
              const items = orderDetail.items || orderDetail.orderDetails || orderDetail.orderItems || orderDetail.products || [];
              
              const hasProduct = items.some((item: any) => {
                const itemProductId = item.productId || item.productID || item.ProductId || item.ProductID;
                const targetProductId = product?.productId || (product as any)?.productID;
                return itemProductId === targetProductId;
              });
              
              if (hasProduct) {
                completedOrderId = order.orderId;
                break;
              }
            }
          }
        }
      }

      if (!completedOrderId) {
        alert('Bạn cần mua và nhận sản phẩm này thành công trước khi đánh giá!');
        setIsSubmittingFeedback(false);
        return;
      }

      // Chuẩn bị payload
      const payload = {
        orderId: completedOrderId,
        productId: product?.productId || (product as any)?.productID,
        message: feedbackMessage.trim(),
        imageUrl: ''
      };

      console.log('🔍 Sending feedback payload:', payload);

      const response = await fetch('http://localhost:5239/api/Feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status);

      // Xử lý response - kiểm tra content-type trước
      const contentType = response.headers.get('content-type');
      let responseData;
      let errorMessage = 'Không thể gửi đánh giá';

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        errorMessage = responseData.message || responseData.Message || errorMessage;
      } else {
        const textResponse = await response.text();
        console.log('📝 Text response:', textResponse);
        errorMessage = textResponse || errorMessage;
      }

      if (!response.ok) {
        console.error('❌ Error response:', { status: response.status, data: responseData || errorMessage });
        throw new Error(errorMessage);
      }

      // Nếu thành công
      const newFeedback = responseData;
      console.log('✅ New feedback:', newFeedback);
      
      // Đảm bảo có userName từ user context nếu API không trả về
      if (!newFeedback.userName && user) {
        newFeedback.userName = user.fullName || user.email || 'Người dùng';
      }

      // Thêm createdAt nếu chưa có
      if (!newFeedback.createdAt) {
        newFeedback.createdAt = new Date().toISOString();
      }
      
      // Thêm feedback mới vào đầu danh sách
      setFeedback([newFeedback, ...feedback]);
      setFeedbackMessage('');
      setFeedbackSuccess(true);
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (err: any) {
      console.error('Lỗi gửi feedback:', err);
      alert(err.message || 'Không thể gửi đánh giá!');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-96 lg:h-[600px]"></div>
            <div className="space-y-6">
              <div className="h-10 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 bg-gray-200 rounded-full w-24"></div>
                <div className="h-10 bg-gray-200 rounded-full w-24"></div>
                <div className="h-10 bg-gray-200 rounded-full w-24"></div>
              </div>
              <div className="h-14 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === ERROR STATE ===
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600 mb-6">{error || 'Sản phẩm này có thể đã bị xóa hoặc không tồn tại'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-500 hover:text-green-600 transition flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Trang chủ
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium">{product.productName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Section */}
          <div className="relative group">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'}
                alt={product.productName}
                className="w-full h-96 lg:h-[600px] object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400';
                }}
                loading="lazy"
              />
              
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-white text-3xl font-bold drop-shadow-lg">HẾT HÀNG</span>
                  </div>
                </div>
              )}
              
              {product.stock <= 5 && product.stock > 0 && (
                <div className="absolute top-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-3 rounded-full text-sm font-bold shadow-xl flex items-center gap-2 animate-pulse">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Chỉ còn {product.stock}
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              {product.productName}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <p className="text-4xl font-bold text-green-600">
                {product.price.toLocaleString('vi-VN')}₫
              </p>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 mb-6 border border-green-100">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-6">
              {product.difficulty && (
                <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {product.difficulty}
                </span>
              )}
              {product.lightRequirement && (
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 rounded-full text-sm font-semibold border border-yellow-200 flex items-center gap-2">
                  ☀️ {product.lightRequirement}
                </span>
              )}
              {product.waterRequirement && (
                <span className="px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full text-sm font-semibold border border-cyan-200 flex items-center gap-2">
                  💧 {product.waterRequirement}
                </span>
              )}
            </div>

            {/* Stock Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Tình trạng kho:</span>
                <span className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} sản phẩm sẵn có` : 'Hết hàng'}
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
              <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-5 py-3 text-gray-600 hover:bg-gray-100 transition font-bold"
                  disabled={quantity <= 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-3 border-x-2 border-gray-300 focus:outline-none font-bold text-lg"
                  min="1"
                  max={product.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-5 py-3 text-gray-600 hover:bg-gray-100 transition font-bold"
                  disabled={quantity >= product.stock}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || !user}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition shadow-lg flex items-center justify-center gap-3 ${
                  product.stock > 0 && user
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-xl hover:scale-105'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {product.stock > 0 ? (user ? 'Thêm vào giỏ hàng' : 'Đăng nhập để mua') : 'Hết hàng'}
              </button>
            </div>

            {/* Feedback Section */}
            <div className="mt-8 border-t-2 border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                Đánh giá từ khách hàng
              </h2>

              {/* Form nhập feedback hoặc thông báo */}
              {user ? (
                canReview ? (
                  <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Viết đánh giá của bạn
                    </h3>
                    
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 resize-none transition"
                      rows={4}
                      disabled={isSubmittingFeedback}
                      maxLength={500}
                    />
                    
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-600">
                        {feedbackMessage.length}/500 ký tự
                      </p>
                      <button
                        onClick={handleSubmitFeedback}
                        disabled={isSubmittingFeedback || !feedbackMessage.trim()}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                          isSubmittingFeedback || !feedbackMessage.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Gửi đánh giá
                          </>
                        )}
                      </button>
                    </div>

                    {/* Success message */}
                    {feedbackSuccess && (
                      <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center gap-2 text-green-800 animate-slide-down">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Đánh giá của bạn đã được gửi thành công!</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border-2 border-orange-200">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                          {checkingReviewPermission ? (
                            <>
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Đang kiểm tra...
                            </>
                          ) : (
                            'Bạn chưa thể đánh giá sản phẩm này'
                          )}
                        </h3>
                        <p className="text-orange-700 text-sm leading-relaxed">
                          Bạn cần mua và nhận sản phẩm này thành công (trạng thái <span className="font-semibold">Hoàn thành</span>) trước khi có thể đánh giá.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : null}

              {/* Danh sách feedback */}
              {feedback.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {feedback.map((fb) => {
                    const displayName = fb.userName || user?.fullName || user?.email || 'Người dùng';
                    const avatarLetter = displayName.charAt(0).toUpperCase();
                    
                    return (
                      <div key={fb.feedbackId} className="bg-gradient-to-r from-gray-50 to-green-50 p-5 rounded-xl border border-gray-200 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                              {avatarLetter}
                            </div>
                            <p className="font-semibold text-gray-800">{displayName}</p>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                          </p>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{fb.message}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg font-semibold mb-2">Chưa có đánh giá nào</p>
                  <p className="text-sm text-gray-400">
                    {user ? 'Hãy là người đầu tiên đánh giá sản phẩm này!' : 'Đăng nhập để đánh giá'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to Store */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-green-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
      
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        /* Custom scrollbar for feedback list */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPageStore;