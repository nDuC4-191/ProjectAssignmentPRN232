// src/pages/admin/AdminDashboard.tsx
import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-green-700 mb-10 text-center">
        🌿 Trang Quản Trị Hệ Thống PlantCare
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link
          to="/admin/products"
          className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition text-center border-t-4 border-green-600"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sản phẩm</h2>
          <p className="text-gray-500">Thêm, sửa, xóa và quản lý sản phẩm cây trồng</p>
        </Link>

        <Link
          to="/admin/categories"
          className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition text-center border-t-4 border-blue-600"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Danh mục</h2>
          <p className="text-gray-500">Quản lý các loại danh mục cây</p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition text-center border-t-4 border-yellow-600"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Người dùng</h2>
          <p className="text-gray-500">Phân quyền, kích hoạt hoặc vô hiệu tài khoản</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
