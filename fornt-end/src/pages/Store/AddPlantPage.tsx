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
      console.log('📤 Gửi create payload:', plantData);
      
      // ⭐ Call API - response có structure { success, data, message }
      const response = await userPlantApi.create(plantData);
      
      // ⭐ Lấy tên cây theo thứ tự ưu tiên:
      // 1. Từ response.data.productName (backend trả về)
      // 2. Từ danh sách products đã load (Product.productID)
      // 3. Fallback "cây mới"
      const plantName = (response as any)?.data?.productName || 
                       products.find(p => p.productID === plantData.productID)?.productName || 
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

  // ⭐ Find product bằng productID (PascalCase như backend)
  const selectedProduct = products.find(p => p.productID === plantData.productID);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Thêm Cây Mới</h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-5">
          
          {/* Dropdown chọn loại cây */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Loại cây <span className="text-red-500">*</span>
            </label>
            {loadingProducts ? (
              <div className="text-gray-500 py-3">Đang tải danh sách cây...</div>
            ) : (
              <select
                name="productID"
                value={plantData.productID}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="0">-- Chọn loại cây --</option>
                {products.map(product => (
                  <option key={product.productID} value={product.productID}>
                    {product.productName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Hiển thị preview cây đã chọn */}
          {selectedProduct && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-4">
                <img 
                  src={selectedProduct.imageUrl || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'} 
                  alt={selectedProduct.productName}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{selectedProduct.productName}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{selectedProduct.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.difficulty && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {selectedProduct.difficulty}
                      </span>
                    )}
                    {selectedProduct.waterRequirement && (
                      <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                        💧 {selectedProduct.waterRequirement}
                      </span>
                    )}
                    {selectedProduct.lightRequirement && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
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
            <label className="block text-gray-700 font-medium mb-2">
              Tên gợi nhớ (Nickname)
            </label>
            <input
              type="text"
              name="nickname"
              value={plantData.nickname || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ví dụ: Cây bếp, Cây phòng khách..."
              maxLength={100}
            />
            <p className="mt-1 text-xs text-gray-500">Đặt tên riêng cho cây của bạn (tùy chọn)</p>
          </div>

          {/* Ngày trồng */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Ngày trồng
            </label>
            <input
              type="date"
              name="plantedDate"
              value={plantData.plantedDate || ''}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Để trống nếu là hôm nay</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/my-plants')}
              disabled={submitting}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || loadingProducts}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang lưu...' : '✓ Lưu cây mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlantPage;