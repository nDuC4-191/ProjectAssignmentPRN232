using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.UserProfile;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _profileService;
        private readonly PlantCareContext _context;

        public UserProfileController(IUserProfileService profileService, PlantCareContext context)
        {
            _profileService = profileService;
            _context = context;
        }

        // GET: api/UserProfile
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
            }

            try
            {
                var profile = await _profileService.GetProfileAsync(userId);
                if (profile == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin người dùng" });
                }

                return Ok(profile);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin: " + ex.Message });
            }
        }

        // PUT: api/UserProfile
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] ProfileDTO profileDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
            }

            try
            {
                var success = await _profileService.UpdateProfileAsync(userId, profileDto);
                if (!success)
                {
                    return BadRequest(new { message = "Cập nhật thông tin thất bại" });
                }

                return Ok(new { success = true, message = "Cập nhật thông tin thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật: " + ex.Message });
            }
        }

        // GET: api/UserProfile/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetProfileStats()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
            }

            try
            {
                // Đếm số cây của user
                var plantsCount = await _context.UserPlants
                    .Where(p => p.UserId == userId)
                    .CountAsync();

                // Đếm số đơn hàng đã hoàn thành
                var ordersCount = await _context.Orders
                    .Where(o => o.UserId == userId &&
                               (o.Status == "Completed" ||
                                o.Status == "completed" ||
                                o.Status == "Delivered" ||
                                o.Status == "delivered"))
                    .CountAsync();

                // Lấy thông tin user để lấy CreatedAt
                var user = await _context.Users.FindAsync(userId);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        plantsCount = plantsCount,
                        ordersCount = ordersCount,
                        createdAt = user?.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi lấy thống kê: " + ex.Message
                });
            }
        }
    }
}