import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const CartPage: React.FC = () => {
    const { cartItems, updateQuantity, removeFromCart, refreshCart } = useCart();

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = '/images/placeholder.png';
    };

    const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">🛒</div>
                <h1 className="text-3xl font-bold mb-4">Giỏ hàng của bạn</h1>
                <p className="text-gray-600 mb-6">Giỏ hàng trống. Hãy thêm sản phẩm vào giỏ hàng!</p>
                <Link 
                    to="/" 
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 border rounded-lg p-4 bg-white shadow-sm">
                            <img 
                                src={item.plantImage || '/images/placeholder.png'} 
                                alt={item.plantName}
                                onError={handleImageError}
                                className="w-20 h-20 rounded-md object-cover"
                            />
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg">{item.plantName}</h3>
                                <p className="text-gray-600">{item.price.toLocaleString()} VND</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="number" 
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const newQty = parseInt(e.target.value);
                                        if (newQty > 0) {
                                            updateQuantity(item.id, newQty);
                                        }
                                    }}
                                    className="w-16 border border-gray-300 p-2 rounded-md text-center focus:ring-2 focus:ring-green-500"
                                    min="1"
                                />
                                <p className="font-semibold w-32 text-right">
                                    {(item.price * item.quantity).toLocaleString()} VND
                                </p>
                                <button 
                                    onClick={() => removeFromCart(item.id)} 
                                    className="text-red-500 hover:text-red-700 px-3 py-2 rounded hover:bg-red-50 transition"
                                    title="Xóa sản phẩm"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg shadow-md sticky top-4">
                        <h2 className="text-2xl font-semibold mb-4">Tổng cộng</h2>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính:</span>
                                <span>{grandTotal.toLocaleString()} VND</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span>Miễn phí</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t border-gray-300">
                            <span>Thành tiền:</span>
                            <span className="text-green-600">{grandTotal.toLocaleString()} VND</span>
                        </div>
                        <Link 
                            to="/checkout" 
                            className="bg-green-600 text-white text-center w-full block py-3 rounded-lg font-semibold hover:bg-green-700 mt-6 transition"
                        >
                            Tiến hành thanh toán
                        </Link>
                        <Link 
                            to="/" 
                            className="text-green-600 text-center w-full block py-3 rounded-lg font-semibold hover:bg-green-50 mt-2 border border-green-600 transition"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;