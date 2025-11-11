using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.OrderDADTO;
using PlantCare.Application.Interfaces;

namespace PlantCare.API.Controllers
{
    [ApiController]
    [Route("api/admin/orders")]
    public class AdminOrdersController : ControllerBase
    {
        private readonly IOrderDAService _orderService;

        public AdminOrdersController(IOrderDAService orderService)
        {
            _orderService = orderService;
        }

        /// <summary>
        /// Get all orders with optional filtering
        /// </summary>
        /// <param name="status">Filter by order status (Pending, Processing, Shipping, Delivered, Completed, Cancelled)</param>
        /// <param name="searchTerm">Search by OrderId, User Name, or Email</param>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status = null, [FromQuery] string? searchTerm = null)
        {
            var orders = await _orderService.GetAllAsync(status, searchTerm);
            return Ok(orders);
        }

        /// <summary>
        /// Get order details by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderService.GetByIdAsync(id);

            if (order == null)
                return NotFound(new { message = "Order not found" });

            return Ok(order);
        }

        /// <summary>
        /// Update order status
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _orderService.UpdateStatusAsync(id, dto);

            if (!success)
                return NotFound(new { message = "Order not found" });

            return Ok(new { message = "Order status updated successfully", orderId = id, newStatus = dto.Status });
        }

        /// <summary>
        /// Get order statistics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var stats = await _orderService.GetStatisticsAsync();
            return Ok(stats);
        }
    }
}