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
        public async Task<IActionResult> Checkout([FromBody] CreateOrderRequestDTO dto) // ✅ ĐỔI TÊN
        {
            try
            {
                var userId = GetCurrentUserId();
                var order = await _orderService.CreateOrderAsync(userId, dto);
                return Ok(new { success = true, data = order, message = "Đặt hàng thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi đặt hàng", error = ex.Message });
            }
        }

        // Task: Lịch sử mua hàng
        [HttpGet("history")]
        public async Task<IActionResult> GetOrderHistory()
        {
            try
            {
                var userId = GetCurrentUserId();
                var orders = await _orderService.GetOrderHistoryAsync(userId);
                return Ok(new { success = true, data = orders });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi tải lịch sử", error = ex.Message });
            }
        }

        // Task: Theo dõi tình trạng đơn hàng
        [HttpGet("{orderId}/status")]
        public async Task<IActionResult> GetOrderStatus(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var status = await _orderService.GetOrderStatusAsync(userId, orderId);
                return Ok(new { success = true, data = status });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đơn hàng" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy trạng thái", error = ex.Message });
            }
        }

        // Task: Lấy chi tiết 1 đơn hàng
        [HttpGet("{orderId}/details")]
        public async Task<IActionResult> GetOrderDetails(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var details = await _orderService.GetOrderDetailsAsync(userId, orderId);
                return Ok(new { success = true, data = details });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đơn hàng" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy chi tiết", error = ex.Message });
            }
        }
    }
}