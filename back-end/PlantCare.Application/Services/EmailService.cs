using Microsoft.Extensions.Logging;
using PlantCare.Application.DTOs.OrderDTO;
using PlantCare.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> logger)
        {
            _logger = logger;
        }

        public Task SendOrderConfirmationEmailAsync(string userEmail, OrderDTO order)
        {
            // === LOGIC GỬI EMAIL GIẢ LẬP ===
            // Thay vì dùng SmtpClient, chúng ta ghi log

            var emailBody = new StringBuilder();
            emailBody.AppendLine($"Kính gửi khách hàng (Email: {userEmail}),");
            emailBody.AppendLine($"Cảm ơn bạn đã đặt hàng. Đơn hàng #{order.OrderId} của bạn đã được xác nhận.");
            emailBody.AppendLine($"Ngày đặt: {order.OrderDate.ToShortDateString()}");
            emailBody.AppendLine($"Trạng thái: {order.Status}");
            emailBody.AppendLine($"Tổng tiền: {order.TotalAmount:C}");
            emailBody.AppendLine("\nChi tiết đơn hàng:");

            foreach (var item in order.OrderItems)
            {
                emailBody.AppendLine($" - {item.ProductName} (SL: {item.Quantity}) - {item.Price:C}");
            }

            emailBody.AppendLine("\nCảm ơn bạn đã tin tưởng PlantCare!");

            // Ghi ra Console/Debug Log thay vì gửi mail
            _logger.LogInformation("--- SENDING EMAIL (MOCK) ---");
            _logger.LogInformation($"To: {userEmail}");
            _logger.LogInformation($"Subject: Xác nhận đơn hàng #{order.OrderId}");
            _logger.LogInformation($"Body: \n{emailBody}");
            _logger.LogInformation("--- END OF EMAIL (MOCK) ---");

            return Task.CompletedTask;
        }
    }
}
