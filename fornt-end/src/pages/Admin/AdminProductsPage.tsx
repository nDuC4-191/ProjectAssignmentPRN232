import React, { useEffect, useState } from "react";
import api from "../../services/api.service";

interface Product {
  productId: number;
  categoryID: number;
  categoryName?: string; // ← THÊM
  productName: string;
  description: string;
  price: number;
  stock: number;
  difficulty: string;
  lightRequirement: string;
  waterRequirement: string;
  soilType: string;
  imageUrl?: string; // ← THÊM
}

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // ← THÊM

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    difficulty: "",
    lightRequirement: "",
    waterRequirement: "",
    soilType: "",
    imageUrl: "", // ← THÊM
  });

  // LẤY DANH SÁCH
  const fetchProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      setProducts(res.data.data); // ← SỬA: res.data.data
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

  // XỬ LÝ INPUT
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // GỬI FORM
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const dataToSend = {
        categoryID: parseInt(formData.categoryId) || 1,
        productName: formData.productName,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        difficulty: formData.difficulty || "Trung bình",
        lightRequirement: formData.lightRequirement || "Vừa",
        waterRequirement: formData.waterRequirement || "Vừa",
        soilType: formData.soilType || "Tơi xốp",
        imageUrl: formData.imageUrl || "https://via.placeholder.com/400", // ← THÊM
      };

      if (editingId !== null) {
        await api.put(`/admin/products/${editingId}`, dataToSend);
        alert("Cập nhật thành công!");
      } else {
        await api.post("/admin/products", dataToSend);
        alert("Thêm thành công!");
      }

      resetForm();
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({
      productName: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      difficulty: "",
      lightRequirement: "",
      waterRequirement: "",
      soilType: "",
      imageUrl: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // XÓA
  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      alert("Xóa thành công!");
      setProducts(products.filter((p) => p.productId !== id));
    } catch (err: any) {
      alert("Lỗi xóa: " + (err.response?.data?.detail || err.message));
    }
  };

  // SỬA
  const handleEdit = (product: Product) => {
    setEditingId(product.productId);
    setFormData({
      productName: product.productName || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      categoryId: product.categoryID?.toString() || "",
      difficulty: product.difficulty || "",
      lightRequirement: product.lightRequirement || "",
      waterRequirement: product.waterRequirement || "",
      soilType: product.soilType || "",
      imageUrl: product.imageUrl || "", // ← THÊM
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  if (loading) return <p className="p-6">Đang tải...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;

  return (
    <div className="p-8">
     <h1 className="text-3xl font-bold text-green-700 mb-6">Quản lý sản phẩm</h1>

      {/* NÚT THÊM MỚI */}
      <div className="mb-4">
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Thêm sản phẩm
          </button>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 mb-8 max-w-xl">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Chỉnh sửa" : "Thêm mới"}
          </h2>

          <div className="grid gap-3">
            <input name="productName" placeholder="Tên" value={formData.productName} onChange={handleChange} required className="border p-2 rounded" />
            <textarea name="description" placeholder="Mô tả" value={formData.description} onChange={handleChange} className="border p-2 rounded" />
            <input type="number" name="price" placeholder="Giá" value={formData.price} onChange={handleChange} required className="border p-2 rounded" />
            <input type="number" name="stock" placeholder="Tồn kho" value={formData.stock} onChange={handleChange} required className="border p-2 rounded" />
            <input type="number" name="categoryId" placeholder="ID danh mục" value={formData.categoryId} onChange={handleChange} required className="border p-2 rounded" />
            
            <input name="imageUrl" placeholder="Link ảnh (Unsplash...)" value={formData.imageUrl} onChange={handleChange} className="border p-2 rounded" /> {/* ← THÊM */}

            <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="border p-2 rounded">
              <option value="">Độ khó</option>
              <option value="Dễ">Dễ</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Khó">Khó</option>
            </select>

            <input name="lightRequirement" placeholder="Ánh sáng" value={formData.lightRequirement} onChange={handleChange} className="border p-2 rounded" />
            <input name="waterRequirement" placeholder="Nước" value={formData.waterRequirement} onChange={handleChange} className="border p-2 rounded" />
            <input name="soilType" placeholder="Đất" value={formData.soilType} onChange={handleChange} className="border p-2 rounded" />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={resetForm} disabled={isSubmitting} className="bg-gray-400 text-white px-4 py-2 rounded-lg">
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              {isSubmitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      )}

      {/* BẢNG */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Ảnh</th> {/* ← THÊM */}
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-left">Giá</th>
              <th className="p-3 text-left">Tồn</th>
              <th className="p-3 text-left">Khó</th>
              <th className="p-3 text-left">Ánh sáng</th>
              <th className="p-3 text-left">Nước</th>
              <th className="p-3 text-left">Đất</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId} className="border-t hover:bg-gray-50">
                <td className="p-3">{p.productId}</td>
                <td className="p-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.productName} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded w-12 h-12" />
                  )}
                </td>
                <td className="p-3">{p.productName}</td>
                <td className="p-3">{p.price.toLocaleString()} ₫</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.difficulty}</td>
                <td className="p-3">{p.lightRequirement}</td>
                <td className="p-3">{p.waterRequirement}</td>
                <td className="p-3">{p.soilType}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(p.productId)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
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