using PlantCare.Application.DTOs.Order;
using PlantCare.Application.DTOs.OrderDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface IOrderService
    {
        /// Task: Thanh toán (COD, ví điện tử, chuyển khoản)
        /// Tạo đơn hàng mới từ giỏ hàng của user.
        /// <param name="userId">ID của user đang đăng nhập</param>
        /// <param name="dto">Thông tin checkout (địa chỉ, thanh toán)</param>
        /// <returns>Chi tiết đơn hàng vừa tạo</returns>
        Task<OrderDTO> CreateOrderAsync(int userId, CreateOrderDTO dto);

        /// Task: Lịch sử mua hàng (Của Vũ)
        /// Lấy danh sách tóm tắt các đơn hàng của user.
        Task<List<OrderSummaryDTO>> GetOrderHistoryAsync(int userId);

        /// Lấy chi tiết 1 đơn hàng cụ thể.
        Task<OrderDTO> GetOrderDetailsAsync(int userId, int orderId);

        // Task: Theo dõi tình trạng đơn hàng
        Task<OrderStatusDTO> GetOrderStatusAsync(int userId, int orderId);
    }
}
