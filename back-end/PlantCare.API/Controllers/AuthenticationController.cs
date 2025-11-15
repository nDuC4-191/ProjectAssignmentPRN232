using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PlantCare.Application.DTOs.Authentication;
using PlantCare.Application.Interfaces;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthenticationService _authService;
        private readonly ILogger<AuthenticationController> _logger;

        public AuthenticationController(IAuthenticationService authService, ILogger<AuthenticationController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        private IActionResult ValidationErrorResponse()
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(new { success = false, errors });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO model)
        {
            if (!ModelState.IsValid)
                return ValidationErrorResponse();

            var result = await _authService.RegisterAsync(model);

            return result
                ? Ok(new { success = true, message = "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản." })
                : BadRequest(new { success = false, message = "Email đã được sử dụng." });
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest(new { success = false, message = "Thiếu token xác minh." });

            _logger.LogInformation("VerifyEmail endpoint called with token: {Token}", token);

            var result = await _authService.VerifyEmailAsync(token);

            if (!result.Success)
            {
                _logger.LogWarning("VerifyEmail failed: {Message}", result.Message);
                return BadRequest(new { success = false, message = result.Message });
            }

            return Ok(new { success = true, message = result.Message });
        }

        [HttpPost("resend-verify")]
        public async Task<IActionResult> ResendVerify([FromBody] ResendVerifyEmailDTO dto)
        {
            if (string.IsNullOrEmpty(dto.Email))
                return BadRequest(new { success = false, message = "Email không được để trống." });

            var result = await _authService.ResendVerifyEmailAsync(dto.Email);

            return result.Success
                ? Ok(new { success = true, message = result.Message })
                : BadRequest(new { success = false, message = result.Message });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO model)
        {
            if (!ModelState.IsValid)
                return ValidationErrorResponse();

            var result = await _authService.LoginAsync(model);

            if (!result.Success)
            {
                if (result.Message == "EMAIL_NOT_VERIFIED")
                    return Unauthorized(new { success = false, message = "Email chưa xác minh. Vui lòng kiểm tra hộp thư!" });

                return Unauthorized(new { success = false, message = result.Message });
            }

            return Ok(new { success = true, message = result.Message, token = result.Token });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO dto)
        {
            if (string.IsNullOrEmpty(dto.Email))
                return BadRequest(new { success = false, message = "Email không được để trống." });

            var exists = await _authService.ForgotPasswordAsync(dto.Email);

            return exists
                ? Ok(new { success = true, message = "Đã gửi email khôi phục mật khẩu!" })
                : NotFound(new { success = false, message = "Không tìm thấy email." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO dto)
        {
            if (string.IsNullOrEmpty(dto.Token) || string.IsNullOrEmpty(dto.NewPassword))
                return BadRequest(new { success = false, message = "Token hoặc mật khẩu không hợp lệ." });

            if (dto.NewPassword.Length < 6)
                return BadRequest(new { success = false, message = "Mật khẩu phải ít nhất 6 ký tự." });

            var result = await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);

            return result
                ? Ok(new { success = true, message = "Đặt lại mật khẩu thành công!" })
                : BadRequest(new { success = false, message = "Token không hợp lệ hoặc đã hết hạn." });
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { success = false, message = "Không tìm thấy user trong token!" });

            int userId = int.Parse(userIdClaim);

            var result = await _authService.ChangePasswordAsync(userId, dto);

            return result
                ? Ok(new { success = true, message = "Đổi mật khẩu thành công!" })
                : Unauthorized(new { success = false, message = "Mật khẩu hiện tại không đúng." });
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { success = true, message = "Đăng xuất thành công!" });
        }

        [Authorize]
        [HttpGet("debug")]
        public IActionResult DebugUser()
        {
            return Ok(new
            {
                Authenticated = User.Identity?.IsAuthenticated,
                UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            });
        }
    }
}
