using Microsoft.Extensions.Configuration;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using Microsoft.AspNetCore.Http;
using PlantCare.Application.Services;
using PlantCare.Application.DTOs.OrderDTO;

namespace PlantCare.Application.Services
{
    public class VNPayService : IVNPayService
    {
        private readonly IConfiguration _config;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public VNPayService(IConfiguration config, IHttpContextAccessor httpContextAccessor)
        {
            _config = config;
            _httpContextAccessor = httpContextAccessor;
        }

        public string CreatePaymentUrl(OrderDTO orderDto)
        {
            // 1. Lấy cấu hình từ appsettings.json
            var vnp_TmnCode = _config["VNPaySettings:TmnCode"];
            var vnp_HashSecret = _config["VNPaySettings:HashSecret"];
            var vnp_Url = _config["VNPaySettings:BaseUrl"];
            var vnp_ReturnUrl = _config["VNPaySettings:ReturnUrl"];
            var vnp_IpnUrl = _config["VNPaySettings:IpnUrl"];

            // 2. Tạo đối tượng VnPayLibrary
            VnPayLibrary vnpay = new VnPayLibrary();

            // 3. Thêm các tham số
            vnpay.AddRequestData("vnp_Version", VnPayLibrary.VERSION);
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);

            // VNPay yêu cầu * 100 (vì họ dùng đơn vị xu)
            vnpay.AddRequestData("vnp_Amount", ((long)orderDto.TotalAmount * 100).ToString());
            vnpay.AddRequestData("vnp_CurrCode", "VND");

            // Mã đơn hàng duy nhất
            vnpay.AddRequestData("vnp_TxnRef", orderDto.OrderId.ToString());
            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan don hang {orderDto.OrderId}");
            vnpay.AddRequestData("vnp_OrderType", "other"); // Loại hàng hóa
            vnpay.AddRequestData("vnp_Locale", "vn"); // Ngôn ngữ
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_ReturnUrl);
            vnpay.AddRequestData("vnp_IpnUrl", vnp_IpnUrl);
            vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));

            // Lấy địa chỉ IP của khách hàng
            var ipAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1" || ipAddress == "127.0.0.1")
            {
                ipAddress = "8.8.8.8"; // Dùng IP của Google DNS để test
            }
            vnpay.AddRequestData("vnp_IpAddr", ipAddress);

            // 4. Tạo URL
            string paymentUrl = vnpay.CreateRequestUrl(vnp_Url, vnp_HashSecret);
            return paymentUrl;
        }
    }
}