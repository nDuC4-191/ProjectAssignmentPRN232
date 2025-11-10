import React, { useEffect, useState } from "react";
import api from "../../services/api.service";

interface Product {
  productId: number;
  productName: string;
  description: string;
  price: number;
  stock: number;
  categoryName?: string;
  imageUrl?: string;
}

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  // 🔹 Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      setProducts(res.data);
    } catch (err: any) {
      setError("Không thể tải danh sách sản phẩm.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔹 Xử lý thay đổi form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Gửi form (thêm / sửa)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          categoryId: parseInt(formData.categoryId),
        });
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await api.post("/admin/products", {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          categoryId: parseInt(formData.categoryId),
        });
        alert("Thêm sản phẩm thành công!");
      }
      setFormData({
        productName: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        imageUrl: "",
      });
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi lưu sản phẩm!");
    }
  };

  // 🔹 Xóa sản phẩm
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter((p) => p.productId !== id));
    } catch (err) {
      console.error(err);
      alert("Không thể xóa sản phẩm!");
    }
  };

  // 🔹 Chỉnh sửa sản phẩm
  const handleEdit = (product: Product) => {
    setEditingId(product.productId);
    setFormData({
      productName: product.productName,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: "",
      imageUrl: product.imageUrl || "",
    });
    setShowForm(true);
  };

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Quản lý sản phẩm</h1>

      {/* Nút thêm mới */}
      <div className="mb-4">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              productName: "",
              description: "",
              price: "",
              stock: "",
              categoryId: "",
              imageUrl: "",
            });
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          {showForm ? "Đóng form" : "➕ Thêm sản phẩm"}
        </button>
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-6 mb-8 max-w-xl"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>

          <div className="grid gap-3">
            <input
              type="text"
              name="productName"
              placeholder="Tên sản phẩm"
              value={formData.productName}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <textarea
              name="description"
              placeholder="Mô tả"
              value={formData.description}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              type="number"
              name="price"
              placeholder="Giá"
              value={formData.price}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="number"
              name="stock"
              placeholder="Số lượng tồn"
              value={formData.stock}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="imageUrl"
              placeholder="Ảnh (URL)"
              value={formData.imageUrl}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {editingId ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      )}

      {/* Bảng danh sách sản phẩm */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Tên sản phẩm</th>
              <th className="p-3 text-left">Giá</th>
              <th className="p-3 text-left">Tồn kho</th>
              <th className="p-3 text-left">Mô tả</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId} className="border-t hover:bg-gray-50">
                <td className="p-3">{p.productId}</td>
                <td className="p-3">{p.productName}</td>
                <td className="p-3">{p.price.toLocaleString()} ₫</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 text-sm text-gray-600">{p.description}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(p.productId)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Không có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
