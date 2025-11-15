using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using Microsoft.Extensions.Options;
using PlantCare.Application.DTOs.OrderDTO;
using PlantCare.Application.Interfaces;
using PlantCare.Application.Settings;
using System.Text;

namespace PlantCare.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value
                ?? throw new ArgumentNullException(nameof(settings), "Email settings must not be null");
        }

        public async Task SendEmailAsync(string to, string subject, string htmlMessage)
        {
            if (string.IsNullOrWhiteSpace(to))
                throw new ArgumentNullException(nameof(to), "Email người nhận không được rỗng");

            if (string.IsNullOrWhiteSpace(_settings.SenderEmail))
                throw new InvalidOperationException("SenderEmail chưa được cấu hình trong EmailSettings");

            if (string.IsNullOrWhiteSpace(_settings.SmtpServer))
                throw new InvalidOperationException("SmtpServer chưa được cấu hình trong EmailSettings");

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_settings.SenderName ?? "PlantCare System", _settings.SenderEmail));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject ?? "(no subject)";
            email.Body = new TextPart(TextFormat.Html) { Text = htmlMessage ?? "" };

            try
            {
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_settings.SmtpServer, _settings.Port, SecureSocketOptions.StartTls);

                // Chỉ authenticate nếu có mật khẩu (Gmail App Password)
                if (!string.IsNullOrWhiteSpace(_settings.Password))
                    await smtp.AuthenticateAsync(_settings.SenderEmail, _settings.Password);

                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                Console.WriteLine($"📧 Email sent to {to} successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Email sending failed: {ex.Message}");
                Console.WriteLine("⚠ Gợi ý kiểm tra:");
                Console.WriteLine(" - App Password Gmail có đúng không?");
                Console.WriteLine(" - Tài khoản Google đã bật 2FA chưa?");
                Console.WriteLine(" - Có bị chặn bởi tường lửa mạng không?");
                // Không throw để hệ thống không crash
            }
        }

        public async Task SendOrderConfirmationEmailAsync(string userEmail, OrderDTO order)
        {
            var body = new StringBuilder();
            body.AppendLine($"<p>Xin chào <strong>{userEmail}</strong>,</p>");
            body.AppendLine($"<p>Cảm ơn bạn đã đặt hàng. Đơn hàng <strong>#{order.OrderId}</strong> đã được xác nhận.</p>");
            body.AppendLine($"<p>Ngày đặt: <strong>{order.OrderDate:dd/MM/yyyy}</strong></p>");
            body.AppendLine($"<p>Trạng thái: <strong>{order.Status}</strong></p>");
            body.AppendLine($"<p>Tổng tiền: <strong>{order.TotalAmount:C}</strong></p>");
            body.AppendLine("<ul>");

            foreach (var item in order.OrderItems)
                body.AppendLine($"<li>{item.ProductName} - SL: {item.Quantity} - {item.Price:C}</li>");

            body.AppendLine("</ul><p>Trân trọng, PlantCare!</p>");

            await SendEmailAsync(userEmail, $"Xác nhận đơn hàng #{order.OrderId}", body.ToString());
        }
    }
}
