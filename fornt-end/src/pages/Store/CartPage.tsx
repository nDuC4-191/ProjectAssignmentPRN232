import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const CartPage: React.FC = () => {
    const { cart, loading, updateItemInCart, removeItemFromCart } = useCart();

    if (loading) return <p>Đang tải giỏ hàng...</p>;

    if (!cart || cart.items.length === 0) {
        return (
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Giỏ hàng của bạn</h1>
                <p>Giỏ hàng trống.</p>
                <Link to="/" className="text-green-600 mt-4 inline-block">Tiếp tục mua sắm</Link>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
            <div className="grid grid-cols-3 gap-8">
                {/* Task: Giỏ hàng (Cập nhật / Xóa) */}
                <div className="col-span-2 space-y-4">
                    {cart.items.map(item => (
                        <div key={item.productId} className="flex items-center gap-4 border-b pb-4">
                            <img src={item.imageUrl || 'https://via.placeholder.com/100'} alt={item.productName} className="w-20 h-20 rounded-md object-cover" />
                            <div className="flex-grow">
                                <h3 className="font-semibold">{item.productName}</h3>
                                <p className="text-gray-600">{item.price.toLocaleString()} VND</p>
                            </div>
                            <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => updateItemInCart({ productId: item.productId, newQuantity: parseInt(e.target.value) })}
                                className="w-16 border p-1 rounded-md text-center"
                                min="1"
                            />
                            <p className="font-semibold w-24 text-right">{item.totalPrice.toLocaleString()} VND</p>
                            <button onClick={() => removeItemFromCart(item.productId)} className="text-red-500 hover:text-red-700">Xóa</button>
                        </div>
                    ))}
                </div>
                
                {/* Tổng kết */}
                <div className="col-span-1 bg-gray-50 p-6 rounded-lg shadow-sm h-fit">
                    <h2 className="text-2xl font-semibold mb-4">Tổng cộng</h2>
                    <div className="flex justify-between mb-2">
                        <span>Tạm tính:</span>
                        <span>{cart.grandTotal.toLocaleString()} VND</span>
                    </div>
                    {/* TODO: Phí ship */}
                    <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
                        <span>Thành tiền:</span>
                        <span>{cart.grandTotal.toLocaleString()} VND</span>
                    </div>
                    {/* Task: Thanh toán (Link) */}
                    <Link to="/checkout" className="bg-green-600 text-white text-center w-full block py-3 rounded-md font-semibold hover:bg-green-700 mt-6">
                        Tiến hành thanh toán
                    </Link>
                </div>
            </div>
        </div>
    );
};
export default CartPage;