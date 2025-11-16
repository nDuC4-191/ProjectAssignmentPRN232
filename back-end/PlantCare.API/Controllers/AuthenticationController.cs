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

        // ===================== REGISTER =====================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return ValidationErrorResponse();

                var result = await _authService.RegisterAsync(model);

                return result
                    ? Ok(new { success = true, message = "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản." })
                    : BadRequest(new { success = false, message = "Email đã được sử dụng." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Register error for email: {Email}", model.Email);
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi đăng ký." });
            }
        }

        // ===================== VERIFY EMAIL =====================
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmailGet([FromQuery] string token)
        {
            _logger.LogInformation("VerifyEmailGet called");
            return await ProcessVerifyEmail(token);
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmailPost([FromBody] VerifyEmailDTO dto)
        {
            _logger.LogInformation("VerifyEmailPost called");
            return await ProcessVerifyEmail(dto?.Token);
        }

        private async Task<IActionResult> ProcessVerifyEmail(string? token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("VerifyEmail: Token is missing");
                    return BadRequest(new { success = false, message = "Thiếu token xác minh." });
                }

                var result = await _authService.VerifyEmailAsync(token);

                if (!result.Success)
                {
                    _logger.LogWarning("VerifyEmail failed");

                    if (result.Message == "TOKEN_EXPIRED")
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "Token đã hết hạn. Vui lòng yêu cầu gửi lại email xác minh.",
                            code = "TOKEN_EXPIRED"
                        });
                    }

                    return BadRequest(new { success = false, message = result.Message });
                }

                _logger.LogInformation("VerifyEmail succeeded");
                return Ok(new { success = true, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "VerifyEmail error");
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi xác minh email." });
            }
        }

        [HttpPost("resend-verify")]
        public async Task<IActionResult> ResendVerify([FromBody] ResendVerifyEmailDTO dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Email))
                    return BadRequest(new { success = false, message = "Email không được để trống." });

                _logger.LogInformation("ResendVerify called");
                var result = await _authService.ResendVerifyEmailAsync(dto.Email);

                return result.Success
                    ? Ok(new { success = true, message = result.Message })
                    : BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ResendVerify error for email: {Email}", dto.Email);
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi gửi lại email." });
            }
        }

        // ===================== LOGIN =====================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return ValidationErrorResponse();

                var result = await _authService.LoginAsync(model);

                if (!result.Success)
                {
                    if (result.Message == "EMAIL_NOT_VERIFIED")
                        return Unauthorized(new { success = false, message = "Email chưa xác minh. Vui lòng kiểm tra hộp thư!", code = "EMAIL_NOT_VERIFIED" });

                    return Unauthorized(new { success = false, message = result.Message });
                }

                var user = await _authService.GetUserByEmailAsync(model.Email);

                // ✅ CHỈ TRẢ VỀ THÔNG TIN CẦN THIẾT
                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    token = result.Token,
                    user = new
                    {
                        userId = user.UserId,
                        email = user.Email,
                        fullName = user.FullName,
                        role = user.Role,
                        avatarUrl = user.AvatarUrl
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login error for email: {Email}", model.Email);
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi đăng nhập." });
            }
        }

        // ===================== FORGOT PASSWORD =====================
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Email))
                    return BadRequest(new { success = false, message = "Email không được để trống." });

                await _authService.ForgotPasswordAsync(dto.Email);

                // ✅ LUÔN TRẢ VỀ SUCCESS ĐỂ TRÁNH EMAIL ENUMERATION
                return Ok(new { success = true, message = "Nếu email tồn tại, bạn sẽ nhận được email khôi phục mật khẩu." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ForgotPassword error");
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra. Vui lòng thử lại sau." });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO dto)
        {
            try
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "ResetPassword error");
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi đặt lại mật khẩu." });
            }
        }

        // ===================== CHANGE PASSWORD =====================
        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            try
            {
                // ModelState đã validate hết rồi
                if (!ModelState.IsValid)
                    return ValidationErrorResponse();

                // Chỉ cần check logic
                if (dto.CurrentPassword == dto.NewPassword)
                    return BadRequest(new { success = false, message = "Mật khẩu mới phải khác mật khẩu cũ." });

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { success = false, message = "Không tìm thấy user trong token!" });

                int userId = int.Parse(userIdClaim);
                var result = await _authService.ChangePasswordAsync(userId, dto);

                return result
                    ? Ok(new { success = true, message = "Đổi mật khẩu thành công!" })
                    : Unauthorized(new { success = false, message = "Mật khẩu hiện tại không đúng." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ChangePassword error");
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi đổi mật khẩu." });
            }
        }

        // ===================== GET CURRENT USER =====================
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { success = false, message = "Token không hợp lệ!" });

                var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(emailClaim))
                    return Unauthorized(new { success = false, message = "Không tìm thấy email trong token!" });

                var user = await _authService.GetUserByEmailAsync(emailClaim);
                if (user == null)
                    return NotFound(new { success = false, message = "Không tìm thấy user!" });

                return Ok(new
                {
                    success = true,
                    user = new
                    {
                        userId = user.UserId,
                        email = user.Email,
                        fullName = user.FullName,
                        phone = user.Phone,
                        address = user.Address,
                        avatarUrl = user.AvatarUrl,
                        role = user.Role,
                        isActive = user.IsActive,
                        isEmailVerified = user.IsEmailVerified,
                        createdAt = user.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetCurrentUser error");
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra!" });
            }
        }

        // ===================== LOGOUT =====================
        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Note: JWT là stateless, logout chỉ cần client xóa token
            // Nếu cần blacklist token, implement ở đây
            return Ok(new { success = true, message = "Đăng xuất thành công!" });
        }

        // ===================== DEBUG ENDPOINTS (Development only) =====================
#if DEBUG
        [Authorize]
        [HttpGet("debug")]
        public IActionResult DebugUser()
        {
            return Ok(new
            {
                authenticated = User.Identity?.IsAuthenticated,
                userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                email = User.FindFirst(ClaimTypes.Email)?.Value,
                role = User.FindFirst(ClaimTypes.Role)?.Value
            });
        }

        [HttpGet("check-token")]
        public IActionResult CheckToken([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest(new { message = "Token is required" });

            try
            {
                var decoded = Uri.UnescapeDataString(token);
                _logger.LogInformation("CheckToken - Original length: {Length}", token.Length);

                return Ok(new
                {
                    original = token,
                    decoded = decoded,
                    length = decoded.Length
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CheckToken error");
                return BadRequest(new { error = ex.Message });
            }
        }
#endif
    }
}