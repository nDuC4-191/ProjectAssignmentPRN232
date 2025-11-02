import React, { useState } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
}

const UserListDA: React.FC = () => {
    const [users, setUsers] = useState<User[]>([
        { id: 1, name: "Nguyễn Văn A", email: "a@example.com", role: "Admin", status: "Active" },
        { id: 2, name: "Trần Thị B", email: "b@example.com", role: "Customer", status: "Inactive" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Omit<User, "id">>({
        name: "",
        email: "",
        role: "Customer",
        status: "Active",
    });

    const handleOpenAdd = () => {
        setEditingUser(null);
        setFormData({ name: "", email: "", role: "Customer", status: "Active" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Bạn có chắc muốn xóa user này không?")) {
            setUsers(users.filter((u) => u.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            // Update
            setUsers(users.map((u) => (u.id === editingUser.id ? { ...editingUser, ...formData } : u)));
        } else {
            // Add
            const newUser: User = {
                id: Date.now(),
                ...formData,
            };
            setUsers([...users, newUser]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-blue-50 p-8">
            <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">👤 User Management</h1>
                    <button
                        onClick={handleOpenAdd}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        + Add User
                    </button>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-green-100">
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-b hover:bg-green-50">
                                <td className="p-3 font-medium">{u.name}</td>
                                <td className="p-3">{u.email}</td>
                                <td className="p-3">{u.role}</td>
                                <td className={`p-3 ${u.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                                    {u.status}
                                </td>
                                <td className="p-3 flex justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenEdit(u)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl">
                        <h2 className="text-xl font-bold mb-4">
                            {editingUser ? "Edit User" : "Add User"}
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Name"
                                className="border p-2 rounded"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="border p-2 rounded"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <select
                                className="border p-2 rounded"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="Admin">Admin</option>
                                <option value="Customer">Customer</option>
                            </select>
                            <select
                                className="border p-2 rounded"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserListDA;
