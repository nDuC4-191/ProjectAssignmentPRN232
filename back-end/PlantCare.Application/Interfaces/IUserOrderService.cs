using PlantCare.Application.DTOs.UserOrders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface IUserOrderService
    {
        Task<List<OrderDTO>> GetOrdersAsync(int userId);
        Task<OrderDTO?> GetOrderDetailAsync(int userId, int orderId);
        Task<int> CreateOrderAsync(int userId, CreateOrderDTO dto);
        Task<bool> UpdateStatusAsync(int orderId, string status);
        Task<bool> CancelOrderAsync(int userId, int orderId);

    }
}
