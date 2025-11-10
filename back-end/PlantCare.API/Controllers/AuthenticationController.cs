using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.Authentication;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthenticationService _authService;

        public AuthenticationController(IAuthenticationService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var token = await _authService.RegisterAsync(model);
            if (token == null)
                return BadRequest(new { message = "Email đã được sử dụng hoặc dữ liệu không hợp lệ." });

            return Ok(new { message = "Đăng ký thành công!", token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var token = await _authService.LoginAsync(model);

            if (token == null)
                return Unauthorized(new { success = false, message = "Email hoặc mật khẩu sai." });

            return Ok(new
            {
                success = true,
                message = "Đăng nhập thành công!",
                token = token
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromQuery] string email)
        {
            var exists = await _authService.ForgotPasswordAsync(email);

            if (!exists)
                return NotFound("Không tìm thấy email");

            return Ok("Đã gửi yêu cầu khôi phục mật khẩu!");
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized("Không tìm thấy user trong token!");

                int userId = int.Parse(userIdClaim);

                var result = await _authService.ChangePasswordAsync(userId, dto);
                return result ? Ok("Đổi mật khẩu thành công!") : NotFound("User không tồn tại");
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Không tìm thấy user trong token!");

            int userId = int.Parse(userIdClaim);

            await _authService.LogoutAsync(userId);

            return Ok("Đăng xuất thành công!");
        }
        [HttpGet("debug")]
        public IActionResult DebugUser()
        {
            return Ok(new
            {
                Authenticated = User.Identity.IsAuthenticated,
                UserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            });
        }
    }
}
