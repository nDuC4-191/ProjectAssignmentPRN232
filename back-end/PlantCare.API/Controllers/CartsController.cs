using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.Cart;
using PlantCare.Application.Interfaces;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // BẮT BUỘC phải login để quản lý giỏ hàng
    public class CartsController : BaseController
    {
        private readonly ICartService _cartService; 

        public CartsController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // Helper để lấy UserId từ token (lấy từ Vũ)
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(userIdClaim.Value);
        }

        // Task: Giỏ hàng - Lấy giỏ hàng của user
        [HttpGet]
        public async Task<IActionResult> GetMyCart()
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.GetCartByUserIdAsync(userId);
            return Ok(cart);

            
        }

        // Task: Giỏ hàng - Thêm sản phẩm
        [HttpPost("add")]
        public async Task<IActionResult> AddItemToCart( [FromBody] AddItemToCartDTO dto )
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.AddItemToCartAsync(userId, dto);
            return Ok(cart);
        }

        // Task: Giỏ hàng - Cập nhật số lượng
        [HttpPut("update")]
        public async Task<IActionResult> UpdateCartItem( [FromBody] UpdateCartItemDTO dto )
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.UpdateItemQuantityAsync(userId, dto);
            return Ok(cart);

        }

        // Task: Giỏ hàng - Xóa sản phẩm
        [HttpDelete("remove/{productId}")]
        public async Task<IActionResult> RemoveItemFromCart(int productId)
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.RemoveItemFromCartAsync(userId, productId);
            return Ok(cart);

        }
    }
}
