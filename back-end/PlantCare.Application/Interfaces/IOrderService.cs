using PlantCare.Application.DTOs.Order;
using PlantCare.Application.DTOs.OrderDTO;

namespace PlantCare.Application.Interfaces
{
    public interface IOrderService
    {
        // ✅ ĐỔI TÊN DTO
        Task<OrderDTO> CreateOrderAsync(int userId, CreateOrderRequestDTO dto);

        Task<List<OrderSummaryDTO>> GetOrderHistoryAsync(int userId);
        Task<OrderDTO> GetOrderDetailsAsync(int userId, int orderId);
        Task<OrderStatusDTO> GetOrderStatusAsync(int userId, int orderId);

        // Admin methods
        Task<IEnumerable<OrderListDto>> GetAllAsync(string? status = null, string? searchTerm = null);
        Task<OrderDetailDto?> GetByIdAsync(int orderId);
        Task<bool> UpdateStatusAsync(int orderId, UpdateOrderStatusDto dto);
        Task<OrderStatisticsDto> GetStatisticsAsync();

        //PaymentController gọi khi VNPAY báo
        //thanh toán thành công
        Task ConfirmOrderPaymentAsync(int orderId);

        //thanh toán thất bại
        Task CancelOrderAsync(int orderId);
    }
}