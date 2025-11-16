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
        private readonly ILogger<UserProfileController> _logger;

        public UserProfileController(
            IUserProfileService profileService,
            PlantCareContext context,
            ILogger<UserProfileController> logger)
        {
            _profileService = profileService;
            _context = context;
            _logger = logger;
        }

        // ===================== GET PROFILE =====================
        /// <summary>
        /// Lấy thông tin hồ sơ người dùng hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    _logger.LogWarning("GetProfile: Không tìm thấy UserId trong token");
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Không tìm thấy thông tin người dùng"
                    });
                }

                var profile = await _profileService.GetProfileAsync(userId.Value);

                if (profile == null)
                {
                    _logger.LogWarning("GetProfile: Không tìm thấy profile cho UserId: {UserId}", userId);
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy thông tin người dùng"
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = profile
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetProfile error");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy thông tin hồ sơ"
                });
            }
        }

        // ===================== UPDATE PROFILE (BỎ QUA EMAIL) =====================
        /// <summary>
        /// Cập nhật thông tin hồ sơ (KHÔNG cho phép đổi email)
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] ProfileDTO profileDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage)
                            .ToList()
                    });
                }

                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    _logger.LogWarning("UpdateProfile: Không tìm thấy UserId trong token");
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Không tìm thấy thông tin người dùng"
                    });
                }

                // ✅ BỎ QUA EMAIL - Không cho phép cập nhật email qua endpoint này
                // Email sẽ được giữ nguyên trong Service layer
                var success = await _profileService.UpdateProfileAsync(userId.Value, profileDto);

                if (!success)
                {
                    _logger.LogWarning("UpdateProfile: Cập nhật thất bại cho UserId: {UserId}", userId);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Cập nhật thông tin thất bại"
                    });
                }

                _logger.LogInformation("UpdateProfile: Cập nhật thành công cho UserId: {UserId}", userId);
                return Ok(new
                {
                    success = true,
                    message = "Cập nhật thông tin thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateProfile error cho UserId: {UserId}", GetCurrentUserId());
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi cập nhật thông tin"
                });
            }
        }

        // ===================== GET STATS =====================
        /// <summary>
        /// Lấy thống kê về cây và đơn hàng của người dùng
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetProfileStats()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    _logger.LogWarning("GetProfileStats: Không tìm thấy UserId trong token");
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Không tìm thấy thông tin người dùng"
                    });
                }

                // Đếm số cây của user (có thể thêm điều kiện !IsDeleted nếu có soft delete)
                var plantsCount = await _context.UserPlants
                    .Where(p => p.UserId == userId.Value)
                    .CountAsync();

                // Đếm số đơn hàng đã hoàn thành
                var completedStatuses = new[] { "Completed", "completed", "Delivered", "delivered" };
                var ordersCount = await _context.Orders
                    .Where(o => o.UserId == userId.Value && completedStatuses.Contains(o.Status))
                    .CountAsync();

                // Đếm tổng số đơn hàng
                var totalOrders = await _context.Orders
                    .Where(o => o.UserId == userId.Value)
                    .CountAsync();

                // Lấy thông tin user
                var user = await _context.Users.FindAsync(userId.Value);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        plantsCount,
                        ordersCount,
                        totalOrders,
                        memberSince = user?.CreatedAt,
                        isEmailVerified = user?.IsEmailVerified ?? false
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetProfileStats error cho UserId: {UserId}", GetCurrentUserId());
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy thống kê"
                });
            }
        }

        // ===================== HELPER METHODS =====================
        /// <summary>
        /// Lấy UserId từ JWT token
        /// </summary>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : null;
        }

        /// <summary>
        /// Lấy Email từ JWT token
        /// </summary>
        private string? GetCurrentUserEmail()
        {
            return User.FindFirst(ClaimTypes.Email)?.Value;
        }

        // ===================== DEBUG (Development Only) =====================
#if DEBUG
        [HttpGet("debug")]
        public IActionResult DebugToken()
        {
            return Ok(new
            {
                authenticated = User.Identity?.IsAuthenticated,
                userId = GetCurrentUserId(),
                email = GetCurrentUserEmail(),
                role = User.FindFirst(ClaimTypes.Role)?.Value,
                claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
            });
        }
#endif
    }
}