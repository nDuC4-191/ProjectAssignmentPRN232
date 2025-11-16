using PlantCare.Application.DTOs.Cart;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface ICartService
    {
        /// Lấy giỏ hàng của user
        Task<CartDTO> GetCartByUserIdAsync(int userId);

        /// Thêm 1 sản phẩm vào giỏ hoặc tăng số lượng nếu đã có
        Task<CartDTO> AddItemToCartAsync(int userId, AddItemToCartDTO dto);

        /// Cập nhật số lượng của 1 sản phẩm trong giỏ
        Task<CartDTO> UpdateItemQuantityAsync(int userId, UpdateCartItemDTO dto);

        /// Xóa 1 sản phẩm khỏi giỏ hàng
        Task<CartDTO> RemoveItemFromCartAsync(int userId, int productId);

        /// Xóa sạch giỏ hàng (thường dùng sau khi thanh toán)
        Task<bool> ClearCartAsync(int userId);

    }
}
