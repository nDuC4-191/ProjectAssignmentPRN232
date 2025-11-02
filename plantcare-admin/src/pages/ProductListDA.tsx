import React, { useState } from "react";

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    image: string;
}

const ProductListDA: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([
        { id: 1, name: "Monstera Deliciosa", price: 450000, stock: 20, image: "/images/monstera.jpg" },
        { id: 2, name: "Snake Plant", price: 320000, stock: 15, image: "/images/snakeplant.jpg" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Omit<Product, "id">>({
        name: "",
        price: 0,
        stock: 0,
        image: "",
    });

    const handleOpenAdd = () => {
        setEditingProduct(null);
        setFormData({ name: "", price: 0, stock: 0, image: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({ name: product.name, price: product.price, stock: product.stock, image: product.image });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
            setProducts(products.filter((p) => p.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProduct) {
            // Update
            setProducts(
                products.map((p) => (p.id === editingProduct.id ? { ...editingProduct, ...formData } : p))
            );
        } else {
            // Add
            const newProduct: Product = {
                id: Date.now(),
                ...formData,
            };
            setProducts([...products, newProduct]);
        }

        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-blue-50 p-8">
            <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                    <button
                        onClick={handleOpenAdd}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        + Add Product
                    </button>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-green-100">
                            <th className="p-3">Image</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Price (₫)</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="border-b hover:bg-green-50">
                                <td className="p-3">
                                    <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-md" />
                                </td>
                                <td className="p-3 font-medium">{p.name}</td>
                                <td className="p-3">{p.price.toLocaleString()}</td>
                                <td className="p-3">{p.stock}</td>
                                <td className="p-3 flex justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenEdit(p)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
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
                            {editingProduct ? "Edit Product" : "Add Product"}
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Product Name"
                                className="border p-2 rounded"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                className="border p-2 rounded"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Stock"
                                className="border p-2 rounded"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Image URL"
                                className="border p-2 rounded"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            />
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

export default ProductListDA;
