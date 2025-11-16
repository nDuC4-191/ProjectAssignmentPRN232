using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.Interfaces;
using PlantCare.Application.Services;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IOrderService _orderService; // Inject OrderService

        public PaymentController(IConfiguration config, IOrderService orderService)
        {
            _config = config;
            _orderService = orderService;
        }

        // ĐÂY LÀ ROUTE TRONG appsettings.json: /api/Payment/vnpay_ipn
        [HttpGet("vnpay_ipn")]
        [AllowAnonymous] // BẮT BUỘC, vì VNPay gọi mà không cần login
        public async Task<IActionResult> VnpayIpnCallback()
        {
            try
            {
                var vnpayData = Request.Query;
                var vnpay = new VnPayLibrary();
                var vnp_HashSecret = _config["VNPaySettings:HashSecret"];

                foreach (var (key, value) in vnpayData)
                {
                    if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                    {
                        vnpay.AddResponseData(key, value);
                    }
                }

                var vnp_SecureHash = vnpay.GetResponseData("vnp_SecureHash");
                bool isValidSignature = vnpay.ValidateSignature(vnp_SecureHash, vnp_HashSecret);

                if (!isValidSignature)
                {
                    // Chữ ký không hợp lệ
                    return Ok(new { RspCode = "97", Message = "Invalid Signature" });
                }

                // Lấy thông tin
                var vnp_TransactionStatus = vnpay.GetResponseData("vnp_TransactionStatus");
                var vnp_TxnRef = vnpay.GetResponseData("vnp_TxnRef"); // Mã đơn hàng (orderId)
                var vnp_Amount = Convert.ToInt64(vnpay.GetResponseData("vnp_Amount")) / 100;

                int orderId;
                if (!int.TryParse(vnp_TxnRef, out orderId))
                {
                    // Lỗi: Mã đơn hàng không phải là số
                    return Ok(new { RspCode = "01", Message = "Order not found (invalid format)" });
                }

                // 1. Kiểm tra đơn hàng có tồn tại trong DB không?
                // (Chúng ta dùng hàm GetByIdAsync của Admin vì nó không cần UserId)
                var orderDetailsDto = await _orderService.GetByIdAsync(orderId);
                if (orderDetailsDto == null)
                {
                    // Lỗi 01: Không tìm thấy đơn hàng
                    return Ok(new { RspCode = "01", Message = "Order not found" });
                }

                // 2. Kiểm tra số tiền có khớp với DB không? (CHỐNG GIAN LẬN)
                if (orderDetailsDto.TotalAmount != vnp_Amount)
                {
                    // Lỗi 04: Sai số tiền
                    return Ok(new { RspCode = "04", Message = "Invalid amount" });
                }

                // 3. Kiểm tra đơn hàng đã được xử lý trước đó chưa? (CHỐNG GỌI LẶP)
                // (Giả sử trạng thái khởi tạo là "Pending" - như đã sửa ở OrderService)
                if (orderDetailsDto.Status != "Processing")
                {
                    // Lỗi 02: Đơn hàng đã được xử lý (đã thành công hoặc đã hủy)
                    // VNPay vẫn cần nhận RspCode "00" để biết chúng ta đã nhận được.
                    return Ok(new { RspCode = "00", Message = "Order already confirmed or cancelled" });
                }


                // Nếu tất cả kiểm tra đều qua:
                if (vnp_TransactionStatus == "00")
                {
                    // Thanh toán thành công
                    await _orderService.ConfirmOrderPaymentAsync(int.Parse(vnp_TxnRef));

                    // Trả về cho VNPay biết đã xử lý
                    return Ok(new { RspCode = "00", Message = "Confirm Success" });
                }
                else
                {
                    // Thanh toán thất bại
                    await _orderService.CancelOrderAsync(int.Parse(vnp_TxnRef));

                    return Ok(new { RspCode = "02", Message = "Order failed" });
                }
            }
            catch (Exception ex)
            {
                // Lỗi không xác định
                Console.WriteLine($"[VNPAY IPN ERROR]: {ex.ToString()}");
                return Ok(new { RspCode = "99", Message = $"Error: {ex.Message}" });
            }
        }
    }
}