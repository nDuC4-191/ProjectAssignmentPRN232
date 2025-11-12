using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.Order;
using PlantCare.Application.Interfaces;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Thanh toán/Theo dõi BẮT BUỘC phải login
    public class OrdersController : BaseController
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(userIdClaim.Value);
        }

        // Task: Thanh toán (Checkout)
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CreateOrderDTO dto)
        {
            var userId = GetCurrentUserId();
            // OrderService sẽ tự động gọi EmailService (chúng ta sẽ implement ở Bước 3)
            var order = await _orderService.CreateOrderAsync(userId, dto);

            return Ok(order);

        }

        // Task: Lịch sử mua hàng (Cũng là 1 phần của Vũ)
        [HttpGet("history")]
        public async Task<IActionResult> GetOrderHistory()
        {
            var userId = GetCurrentUserId();
            var orders = await _orderService.GetOrderHistoryAsync(userId);
            return Ok(orders);
        }

        // Task: Theo dõi tình trạng đơn hàng
        [HttpGet("{orderId}/status")]
        public async Task<IActionResult> GetOrderStatus(int orderId)
        {
            var userId = GetCurrentUserId();
            var status = await _orderService.GetOrderStatusAsync(userId, orderId);
            if (status == null) return NotFound("Không tìm thấy đơn hàng");
            return Ok(status);
        }

        // Task: Lấy chi tiết 1 đơn hàng
        [HttpGet("{orderId}/details")]
        public async Task<IActionResult> GetOrderDetails(int orderId)
        {
            var userId = GetCurrentUserId();
            var details = await _orderService.GetOrderDetailsAsync(userId, orderId);
            return Ok(details);
        }
    }
}
