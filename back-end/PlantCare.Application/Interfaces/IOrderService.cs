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
        // ---------------------------
        // 🧾 Phần của HEAD (Thanh toán, lịch sử đơn hàng, trạng thái)
        // ---------------------------

        /// <summary>
        /// Thanh toán (COD, ví điện tử, chuyển khoản)
        /// Tạo đơn hàng mới từ giỏ hàng của user.
        /// </summary>
        /// <param name="userId">ID của user đang đăng nhập</param>
        /// <param name="dto">Thông tin checkout (địa chỉ, thanh toán)</param>
        /// <returns>Chi tiết đơn hàng vừa tạo</returns>
        Task<OrderDTO> CreateOrderAsync(int userId, CreateOrderDTO dto);

        /// <summary>
        /// Lịch sử mua hàng (Của Vũ)
        /// Lấy danh sách tóm tắt các đơn hàng của user.
        /// </summary>
        Task<List<OrderSummaryDTO>> GetOrderHistoryAsync(int userId);

        /// <summary>
        /// Lấy chi tiết 1 đơn hàng cụ thể.
        /// </summary>
        Task<OrderDTO> GetOrderDetailsAsync(int userId, int orderId);

        /// <summary>
        /// Theo dõi tình trạng đơn hàng.
        /// </summary>
        Task<OrderStatusDTO> GetOrderStatusAsync(int userId, int orderId);

        // ---------------------------
        // 📊 Phần của origin/nhatle (Quản lý admin)
        // ---------------------------

        /// <summary>
        /// Lấy danh sách tất cả đơn hàng (có thể lọc theo trạng thái, tìm kiếm).
        /// </summary>
        Task<IEnumerable<OrderListDto>> GetAllAsync(string? status = null, string? searchTerm = null);

        /// <summary>
        /// Lấy chi tiết 1 đơn hàng theo ID.
        /// </summary>
        Task<OrderDetailDto?> GetByIdAsync(int orderId);

        /// <summary>
        /// Cập nhật trạng thái đơn hàng.
        /// </summary>
        Task<bool> UpdateStatusAsync(int orderId, UpdateOrderStatusDto dto);

        /// <summary>
        /// Lấy thống kê đơn hàng (doanh thu, số lượng...).
        /// </summary>
        Task<OrderStatisticsDto> GetStatisticsAsync();
    }
}
