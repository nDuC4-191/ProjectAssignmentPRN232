using PlantCare.Application.DTOs.OrderDTO;
using PlantCare.Infrastructure.Models; 

namespace PlantCare.Application.Interfaces
{
    public interface IVNPayService
    {
        string CreatePaymentUrl(OrderDTO orderDto);
    }
}