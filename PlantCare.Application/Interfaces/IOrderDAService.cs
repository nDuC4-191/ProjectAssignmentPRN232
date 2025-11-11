using PlantCare.Application.DTOs.OrderDADTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface IOrderDAService
    {
        Task<IEnumerable<OrderListDto>> GetAllAsync(string? status = null, string? searchTerm = null);
        Task<OrderDetailDto?> GetByIdAsync(int orderId);
        Task<bool> UpdateStatusAsync(int orderId, UpdateOrderStatusDto dto);
        Task<OrderStatisticsDto> GetStatisticsAsync();
    }
}
