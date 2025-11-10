using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.UserOrders;
using PlantCare.Application.Interfaces;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserOrdersController : ControllerBase
    {
        private readonly IUserOrderService _service;

        public UserOrdersController(IUserOrderService service)
        {
            _service = service;
        }
        private int GetUserId() =>
           int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            return Ok(await _service.GetOrdersAsync(GetUserId()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderDetail(int id)
        {
            var order = await _service.GetOrderDetailAsync(GetUserId(), id);
            return order == null ? NotFound() : Ok(order);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder(CreateOrderDTO dto)
        {
            var id = await _service.CreateOrderAsync(GetUserId(), dto);
            return Ok(new { OrderID = id });
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
        {
            return await _service.UpdateStatusAsync(id, status)
                ? Ok("Status updated")
                : NotFound();
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            return await _service.CancelOrderAsync(GetUserId(), id)
                ? Ok("Order cancelled")
                : BadRequest("Can't cancel");
        }
    }
}
