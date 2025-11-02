import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import ProductList from "./pages/ProductListDA";
import UserList from "./pages/UserListDA";

const App: React.FC = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                {/* Navbar */}
                <nav className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
                    <h1 className="text-xl font-bold">🌿 PlantCare Admin</h1>
                    <div className="flex gap-6">
                        <Link to="/products" className="hover:underline">
                            Products
                        </Link>
                        <Link to="/users" className="hover:underline">
                            Users
                        </Link>
                    </div>
                </nav>

                {/* Main content */}
                <main className="p-6">
                    <Routes>
                        <Route path="/" element={<Navigate to="/products" />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/users" element={<UserList />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
