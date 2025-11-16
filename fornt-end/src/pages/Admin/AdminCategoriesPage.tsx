import React, { useEffect, useState } from "react";
import api from "../../services/api.service";

interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
}

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories");
      // ✅ FIX: Lấy res.data.data thay vì res.data
      setCategories(res.data.data || []);
    } catch (err) {
      setError("Không thể tải danh sách danh mục.");
      // ✅ FIX: Set về array rỗng khi có lỗi
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // ✅ FIX: Gửi đầy đủ payload cho PUT request
        const payload = {
          categoryId: editingId,
          categoryName: formData.categoryName,
          description: formData.description,
          parentId: null
        };
        await api.put(`/admin/categories/${editingId}`, payload);
        alert("Cập nhật danh mục thành công!");
      } else {
        await api.post("/admin/categories", formData);
        alert("Thêm danh mục thành công!");
      }
      setFormData({ categoryName: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Có lỗi xảy ra khi lưu danh mục!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(categories.filter((c) => c.categoryId !== id));
    } catch {
      alert("Không thể xóa danh mục!");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.categoryId);
    setFormData({
      categoryName: category.categoryName,
      description: category.description,
    });
    setShowForm(true);
  };

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Quản lý danh mục</h1>

      <div className="mb-4">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ categoryName: "", description: "" });
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          {showForm ? "Đóng form" : "➕ Thêm danh mục"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 mb-8 max-w-xl">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h2>

          <div className="grid gap-3">
            <input
              type="text"
              name="categoryName"
              placeholder="Tên danh mục"
              value={formData.categoryName}
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

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Tên danh mục</th>
              <th className="p-3 text-left">Mô tả</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {/* ✅ FIX: Thêm safety check */}
            {Array.isArray(categories) && categories.map((c) => (
              <tr key={c.categoryId} className="border-t hover:bg-gray-50">
                <td className="p-3">{c.categoryId}</td>
                <td className="p-3">{c.categoryName}</td>
                <td className="p-3 text-sm text-gray-600">{c.description}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(c.categoryId)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Không có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;