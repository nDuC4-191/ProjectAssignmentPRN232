// src/pages/AddPlantPage.tsx
import React, { useState } from 'react';
import { userPlantApi } from "../../services/api.service";
import type { CreateUserPlantDTO } from "../../types/userPlant.types";
import { useNavigate } from 'react-router-dom';

const AddPlantPage: React.FC = () => {
  const navigate = useNavigate();

  // Khởi tạo state đúng theo interface CreateUserPlantDTO (camelCase)
  const [plantData, setPlantData] = useState<CreateUserPlantDTO>({
    productId: 1,    // mặc định 1, bạn có thể thay bằng select để lấy productId thật
    nickname: '',
    plantedDate: '', // YYYY-MM-DD hoặc '' nếu không chọn
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Nếu chỉnh productId (input number) thì ép kiểu number
    if (name === 'productId') {
      setPlantData(prev => ({ ...prev, productId: Number(value) }));
      return;
    }

    // Các field khác là string
    setPlantData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra nhanh trước khi gửi
    if (!plantData.productId || Number.isNaN(plantData.productId)) {
      alert('Vui lòng nhập Product ID hợp lệ');
      return;
    }

    try {
      console.log('📤 Gửi create payload:', plantData);
      await userPlantApi.create(plantData);
      alert('🌱 Thêm cây mới thành công!');
      navigate('/my-plants');
    } catch (err: any) {
      console.error('Error adding plant:', err);
      const msg = err?.response?.data?.message || 'Không thể thêm cây mới';
      alert(msg);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">➕ Thêm Cây Mới</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 max-w-lg mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Product ID (mã sản phẩm)</label>
          <input
            type="number"
            name="productId"
            value={plantData.productId}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
            min={1}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Tên gợi nhớ (Nickname)</label>
          <input
            type="text"
            name="nickname"
            value={plantData.nickname}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Ví dụ: Cây bếp, Cây phòng khách..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Ngày trồng</label>
          <input
            type="date"
            name="plantedDate"
            value={plantData.plantedDate || ''}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Ghi chú</label>
          <input
            type="text"
            name="notes"
            value={plantData.notes || ''}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Ghi chú thêm (tùy chọn)"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Lưu cây mới
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPlantPage;
