import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userPlantApi } from "../../services/api.service";
import { productService } from "../../services/product.service";
import type { CreateUserPlantDTO } from "../../types/userPlant.types";
import type { Product } from "../../types/product.types";

const AddPlantPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [plantData, setPlantData] = useState<CreateUserPlantDTO>({
    productID: 0,
    nickname: '',
    plantedDate: null,
    notes: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await productService.getProducts({ pageNumber: 1, pageSize: 100 });
        setProducts(data.items || []);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Không thể tải danh sách cây');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'productID') {
      setPlantData(prev => ({ ...prev, productID: Number(value) }));
      return;
    }

    if (name === 'plantedDate') {
      setPlantData(prev => ({ ...prev, plantedDate: value || null }));
      return;
    }

    setPlantData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!plantData.productID || plantData.productID === 0) {
      setError('Vui lòng chọn loại cây');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await userPlantApi.create(plantData);
      
      // Lấy tên cây từ response hoặc danh sách products
      const plantName = (response as any)?.data?.productName || 
                       products.find(p => p.productId === plantData.productID)?.productName || 
                       'cây mới';
      
      alert(`🌱 Đã thêm "${plantName}" thành công!`);
      navigate('/my-plants');
    } catch (err: any) {
      console.error('Error adding plant:', err);
      const msg = err?.response?.data?.message || 'Không thể thêm cây mới';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Fix: Sử dụng productId (camelCase) thay vì productID
  const selectedProduct = products.find(p => p.productId === plantData.productID);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-7xl">🌱</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Thêm Cây Mới Vào Vườn
            </h1>
            <p className="text-lg text-gray-600">
              Chọn loại cây và thêm thông tin để bắt đầu chăm sóc
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-8 p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-700 rounded-2xl flex items-center gap-3 shadow-lg animate-shake">
              <span className="text-3xl">⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-3xl p-8 md:p-10 space-y-8 border-2 border-gray-100">
            
            {/* Dropdown chọn loại cây */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-bold text-lg mb-3">
                <span className="text-2xl">🌳</span>
                <span>Loại Cây <span className="text-red-500">*</span></span>
              </label>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-green-200 border-t-green-600 mr-3"></div>
                  <span className="font-medium">Đang tải danh sách cây...</span>
                </div>
              ) : (
                <select
                  name="productID"
                  value={plantData.productID}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 text-lg focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all bg-white"
                >
                  <option value="0">-- Chọn loại cây --</option>
                  {products.map(product => (
                    <option key={product.productId} value={product.productId}>
                      {product.productName}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                <span>💡</span>
                <span>Chọn loại cây bạn muốn thêm vào vườn</span>
              </p>
            </div>

            {/* Hiển thị preview cây đã chọn */}
            {selectedProduct && (
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-3xl shadow-lg animate-fadeIn">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={selectedProduct.imageUrl || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'} 
                      alt={selectedProduct.productName}
                      className="w-full md:w-32 h-32 object-cover rounded-2xl shadow-md"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedProduct.productName}</h3>
                    {selectedProduct.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.difficulty && (
                        <span className="text-xs bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-3 py-1.5 rounded-full font-bold border border-blue-200">
                          📊 {selectedProduct.difficulty}
                        </span>
                      )}
                      {selectedProduct.waterRequirement && (
                        <span className="text-xs bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 px-3 py-1.5 rounded-full font-bold border border-cyan-200">
                          💧 {selectedProduct.waterRequirement}
                        </span>
                      )}
                      {selectedProduct.lightRequirement && (
                        <span className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-1.5 rounded-full font-bold border border-yellow-200">
                          ☀️ {selectedProduct.lightRequirement}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tên gợi nhớ (Nickname) */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-bold text-lg mb-3">
                <span className="text-2xl">🏷️</span>
                <span>Tên Gợi Nhớ (Tùy chọn)</span>
              </label>
              <input
                type="text"
                name="nickname"
                value={plantData.nickname || ''}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 text-lg focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all"
                placeholder="Ví dụ: Cây bếp, Cây phòng khách, Cây nhỏ của tôi..."
                maxLength={100}
              />
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                <span>💡</span>
                <span>Đặt tên riêng để dễ nhớ và phân biệt các cây</span>
              </p>
            </div>

            {/* Ngày trồng */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-bold text-lg mb-3">
                <span className="text-2xl">📅</span>
                <span>Ngày Trồng (Tùy chọn)</span>
              </label>
              <input
                type="date"
                name="plantedDate"
                value={plantData.plantedDate || ''}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 text-lg focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all"
              />
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                <span>💡</span>
                <span>Để trống nếu bạn trồng hôm nay</span>
              </p>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-bold text-lg mb-3">
                <span className="text-2xl">📝</span>
                <span>Ghi Chú (Tùy chọn)</span>
              </label>
              <textarea
                name="notes"
                value={plantData.notes || ''}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 text-lg focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all resize-none"
                placeholder="Thêm ghi chú về cây: vị trí đặt, đặc điểm, lịch chăm sóc..."
                rows={4}
                maxLength={500}
              />
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                <span>💡</span>
                <span>Ghi chú giúp bạn theo dõi tình trạng cây tốt hơn</span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/my-plants')}
                disabled={submitting}
                className="px-8 py-4 bg-gradient-to-r from-gray-100 to-slate-100 hover:from-gray-200 hover:to-slate-200 text-gray-700 font-bold rounded-2xl transition-all shadow-md hover:shadow-lg border-2 border-gray-300 text-lg"
              >
                ← Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={submitting || loadingProducts}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Đang Lưu...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">✓</span>
                    <span>Thêm Cây Vào Vườn</span>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-start gap-4">
              <span className="text-4xl">💡</span>
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Mẹo chăm sóc cây tốt hơn</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Đặt tên gợi nhớ giúp bạn dễ quản lý khi có nhiều cây</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Ghi chú ngày trồng để theo dõi sự phát triển của cây</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Thêm ghi chú về vị trí và đặc điểm để chăm sóc đúng cách</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlantPage;