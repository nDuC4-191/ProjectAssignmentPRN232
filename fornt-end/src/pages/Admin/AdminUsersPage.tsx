import React, { useEffect, useState } from "react";
import api from "../../services/api.service";

interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: User) => {
    try {
      await api.put(`/admin/users/${user.userId}/active?isActive=${!user.active}`);
      setUsers(
        users.map((u) =>
          u.userId === user.userId ? { ...u, active: !u.active } : u
        )
      );
    } catch {
      alert("Không thể thay đổi trạng thái hoạt động!");
    }
  };

  const handleChangeRole = async (user: User) => {
    const newRole = prompt("Nhập vai trò mới (USER / ADMIN):", user.role);
    if (!newRole) return;
    try {
      await api.put(`/admin/users/${user.userId}/role?role=${newRole}`);
      setUsers(users.map((u) => (u.userId === user.userId ? { ...u, role: newRole } : u)));
      alert("Cập nhật vai trò thành công!");
    } catch {
      alert("Không thể cập nhật vai trò!");
    }
  };

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Quản lý người dùng</h1>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Vai trò</th>
              <th className="p-3 text-left">Trạng thái</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId} className="border-t hover:bg-gray-50">
                <td className="p-3">{u.userId}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.active ? "✅ Hoạt động" : "❌ Vô hiệu"}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleChangeRole(u)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Đổi vai trò
                  </button>
                  <button
                    onClick={() => handleToggleActive(u)}
                    className={`${
                      u.active ? "bg-red-600" : "bg-green-600"
                    } text-white px-3 py-1 rounded hover:opacity-80 transition`}
                  >
                    {u.active ? "Vô hiệu" : "Kích hoạt"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Không có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
