using PlantCare.Application.DTOs.OrderDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface IEmailService
    {
        // Gửi email xác nhận đơn hàng
        Task SendOrderConfirmationEmailAsync(string userEmail, OrderDTO order);
    }
}
