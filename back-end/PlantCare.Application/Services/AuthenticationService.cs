using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;
using PlantCare.Application.DTOs.Authentication;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PlantCare.Application.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly PlantCareContext _context;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthenticationService> _logger;

        public AuthenticationService(
            PlantCareContext context,
            IConfiguration config,
            IEmailService emailService,
            ILogger<AuthenticationService> logger)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
            _logger = logger;
        }

        // ===================== REGISTER =====================
        public async Task<bool> RegisterAsync(RegisterDTO model)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Email == model.Email))
                {
                    _logger.LogWarning("Register: Email {Email} already exists", model.Email);
                    return false;
                }

                string token = Guid.NewGuid().ToString("N").ToLower();

                var user = new User
                {
                    FullName = model.FullName,
                    Email = model.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
                    Phone = model.Phone,
                    Address = model.Address,
                    Role = "Customer",
                    IsActive = false,
                    IsEmailVerified = false,
                    EmailVerificationToken = token,
                    EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24),
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Users.AddAsync(user);
                var saveResult = await _context.SaveChangesAsync();

                _logger.LogInformation("Register: User created with ID {UserId}, SaveChanges returned {Count}",
                    user.UserId, saveResult);

                await SendVerificationEmail(user.FullName, user.Email, token);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Register: Error creating user for email {Email}", model.Email);
                return false;
            }
        }

        // ===================== LOGIN =====================
        public async Task<(bool Success, string Message, string? Token)> LoginAsync(LoginDTO model)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
                if (user == null)
                {
                    _logger.LogWarning("Login: User not found with email {Email}", model.Email);
                    return (false, "Tài khoản không tồn tại.", null);
                }

                if (!BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Login: Invalid password for user {UserId}", user.UserId);
                    return (false, "Mật khẩu không chính xác.", null);
                }

                if (user.IsEmailVerified != true)
                {
                    _logger.LogWarning("Login: Email not verified for user {UserId}", user.UserId);
                    return (false, "EMAIL_NOT_VERIFIED", null);
                }

                if (user.IsActive != true)
                {
                    _logger.LogWarning("Login: Account not active for user {UserId}", user.UserId);
                    return (false, "Tài khoản chưa được kích hoạt.", null);
                }

                string token = GenerateJwtToken(user);
                _logger.LogInformation("Login: Success for user {UserId}", user.UserId);
                return (true, "Đăng nhập thành công!", token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login: Unexpected error for email {Email}", model.Email);
                return (false, "Có lỗi xảy ra khi đăng nhập.", null);
            }
        }

        // ===================== VERIFY EMAIL =====================
        public async Task<(bool Success, string Message)> VerifyEmailAsync(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                {
                    _logger.LogWarning("VerifyEmail: Token is null or empty");
                    return (false, "Token không hợp lệ.");
                }

                // Normalize token
                var normalized = Uri.UnescapeDataString(token)
                    .Trim()
                    .Replace("\"", "")
                    .Replace(" ", "")
                    .ToLower();

                _logger.LogInformation("VerifyEmail: Processing token = {Token}", normalized);

                // Tìm user
                var user = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.EmailVerificationToken != null &&
                                            u.EmailVerificationToken.ToLower() == normalized);

                if (user == null)
                {
                    _logger.LogWarning("VerifyEmail: No user found with this token");
                    return (false, "Token không tồn tại hoặc đã được sử dụng.");
                }

                _logger.LogInformation("VerifyEmail: Found user {UserId} ({Email})", user.UserId, user.Email);

                // Kiểm tra đã verify chưa
                if (user.IsEmailVerified == true)
                {
                    _logger.LogInformation("VerifyEmail: User {UserId} already verified", user.UserId);
                    return (true, "Email đã được xác minh. Bạn có thể đăng nhập.");
                }

                // Kiểm tra token hết hạn
                if (user.EmailVerificationTokenExpiry == null || user.EmailVerificationTokenExpiry < DateTime.UtcNow)
                {
                    _logger.LogWarning("VerifyEmail: Token expired for user {UserId}", user.UserId);
                    return (false, "TOKEN_EXPIRED");
                }

                // === THỰC HIỆN UPDATE BẰNG RAW SQL (GIỐNG TEST ENDPOINT) ===
                _logger.LogInformation("VerifyEmail: Updating user {UserId} via raw SQL", user.UserId);

                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE Users SET IsEmailVerified = 1, IsActive = 1, EmailVerificationToken = NULL, EmailVerificationTokenExpiry = NULL, UpdatedAt = GETUTCDATE() WHERE UserId = {0}",
                    user.UserId);

                _logger.LogInformation("VerifyEmail: Rows affected = {Count}", rowsAffected);

                if (rowsAffected == 0)
                {
                    _logger.LogError("VerifyEmail: No rows updated for UserId {UserId}", user.UserId);
                    return (false, "Không thể cập nhật. Vui lòng thử lại.");
                }

                // Clear EF cache
                _context.ChangeTracker.Clear();

                // Verify lại kết quả
                var updatedUser = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.UserId == user.UserId);

                _logger.LogInformation("VerifyEmail: Verification result - IsVerified={IsVerified}, IsActive={IsActive}",
                    updatedUser?.IsEmailVerified, updatedUser?.IsActive);

                if (updatedUser?.IsEmailVerified == true && updatedUser?.IsActive == true)
                {
                    _logger.LogInformation("VerifyEmail: SUCCESS for user {UserId}", user.UserId);
                    return (true, "Xác minh email thành công.");
                }
                else
                {
                    _logger.LogError("VerifyEmail: Update failed verification - IsVerified={IsVerified}, IsActive={IsActive}",
                        updatedUser?.IsEmailVerified, updatedUser?.IsActive);
                    return (false, "Xác minh thất bại. Vui lòng liên hệ admin.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "VerifyEmail: Exception occurred - {Message}", ex.Message);
                return (false, "Có lỗi xảy ra khi xác minh email.");
            }
        }

        // ===================== RESEND VERIFY EMAIL =====================
        public async Task<(bool Success, string Message)> ResendVerifyEmailAsync(string email)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    _logger.LogWarning("ResendVerifyEmail: User not found with email {Email}", email);
                    return (false, "Email không tồn tại.");
                }

                if (user.IsEmailVerified == true)
                {
                    _logger.LogInformation("ResendVerifyEmail: Email already verified for user {UserId}", user.UserId);
                    return (true, "Email đã được xác minh.");
                }

                string token = Guid.NewGuid().ToString("N").ToLower();
                user.EmailVerificationToken = token;
                user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _logger.LogInformation("ResendVerifyEmail: New token generated for user {UserId}", user.UserId);

                await SendVerificationEmail(user.FullName, user.Email, token);

                return (true, "Đã gửi lại email xác minh!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ResendVerifyEmail: Error for email {Email}", email);
                return (false, "Có lỗi xảy ra khi gửi email.");
            }
        }

        // ===================== FORGOT PASSWORD =====================
        public async Task<bool> ForgotPasswordAsync(string email)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == email);
                if (user == null)
                {
                    _logger.LogWarning("ForgotPassword: User not found with email {Email}", email);
                    return false;
                }

                string token = Guid.NewGuid().ToString("N").ToLower();
                user.EmailVerificationToken = token;
                user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddMinutes(30);
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _logger.LogInformation("ForgotPassword: Reset token generated for user {UserId}", user.UserId);

                string resetUrl = $"{_config["AppSettings:ClientUrl"]}/reset-password?token={Uri.EscapeDataString(token)}";

                string html = $@"
<h2>Khôi phục mật khẩu PlantCare</h2>
<p>Xin chào <b>{user.FullName}</b>,</p>
<p>Nhấn để đặt lại mật khẩu:</p>
<p><a href='{resetUrl}'>ĐẶT LẠI MẬT KHẨU</a></p>
<p>Link này sẽ hết hạn sau 30 phút.</p>";

                await _emailService.SendEmailAsync(email, "Khôi phục mật khẩu - PlantCare", html);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ForgotPassword: Error for email {Email}", email);
                return false;
            }
        }

        // ===================== RESET PASSWORD =====================
        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            try
            {
                var normalized = token.Trim().Replace("\"", "").Replace(" ", "").ToLower();

                var user = await _context.Users.FirstOrDefaultAsync(x =>
                    x.EmailVerificationToken != null &&
                    x.EmailVerificationToken.ToLower() == normalized);

                if (user == null)
                {
                    _logger.LogWarning("ResetPassword: User not found with token");
                    return false;
                }

                if (user.EmailVerificationTokenExpiry == null || user.EmailVerificationTokenExpiry < DateTime.UtcNow)
                {
                    _logger.LogWarning("ResetPassword: Token expired for user {UserId}", user.UserId);
                    return false;
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
                user.EmailVerificationToken = null;
                user.EmailVerificationTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _logger.LogInformation("ResetPassword: Password reset successfully for user {UserId}", user.UserId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ResetPassword: Unexpected error");
                return false;
            }
        }

        // ===================== CHANGE PASSWORD =====================
        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("ChangePassword: User not found with ID {UserId}", userId);
                    return false;
                }

                if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                {
                    _logger.LogWarning("ChangePassword: Invalid current password for user {UserId}", userId);
                    return false;
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _logger.LogInformation("ChangePassword: Password changed successfully for user {UserId}", userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ChangePassword: Error for user {UserId}", userId);
                return false;
            }
        }

        // ===================== JWT GENERATOR =====================
        private string GenerateJwtToken(User user)
        {
            var jwt = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Role, user.Role ?? "Customer"),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(6),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ===================== SEND VERIFY EMAIL =====================
        private async Task SendVerificationEmail(string fullName, string email, string token)
        {
            try
            {
                string verifyUrl = $"{_config["AppSettings:ClientUrl"]}/verify-email?token={Uri.EscapeDataString(token)}";

                string html = $@"
<h2>Xác minh tài khoản PlantCare 🌿</h2>
<p>Xin chào <b>{fullName}</b>,</p>
<p>Cảm ơn bạn đã đăng ký tài khoản PlantCare!</p>
<p>Nhấn vào nút bên dưới để xác minh tài khoản:</p>
<p><a href='{verifyUrl}' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>XÁC MINH TÀI KHOẢN</a></p>
<p>Hoặc copy link này vào trình duyệt:</p>
<p style='word-break: break-all;'>{verifyUrl}</p>
<p>Link này sẽ hết hạn sau 24 giờ.</p>";

                await _emailService.SendEmailAsync(email, "Xác minh tài khoản - PlantCare", html);
                _logger.LogInformation("SendVerificationEmail: Email sent to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SendVerificationEmail: Error sending email to {Email}", email);
                throw;
            }
        }

        // ===================== LOGOUT =====================
        public Task<bool> LogoutAsync(int userId)
        {
            _logger.LogInformation("Logout: User {UserId} logged out", userId);
            return Task.FromResult(true);
        }

        // ===================== GET USER BY EMAIL =====================
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            try
            {
                return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetUserByEmail: Error retrieving user with email {Email}", email);
                return null;
            }
        }

        // ===================== DEBUG: DIRECT SQL UPDATE TEST =====================
        public async Task<object> DirectSqlUpdateTestAsync(int userId)
        {
            try
            {
                _logger.LogInformation("=== DirectSqlUpdateTest START for UserId={UserId} ===", userId);

                var dbConnection = _context.Database.GetDbConnection();
                _logger.LogInformation("Database: {Database}", dbConnection.Database);

                // Check user BEFORE
                var userBefore = await _context.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                _logger.LogInformation("BEFORE: IsVerified={Verified}, IsActive={Active}",
                    userBefore?.IsEmailVerified, userBefore?.IsActive);

                // Execute raw SQL
                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE Users SET IsEmailVerified = 1, IsActive = 1, EmailVerificationToken = NULL, EmailVerificationTokenExpiry = NULL, UpdatedAt = GETUTCDATE() WHERE UserId = {0}",
                    userId);

                _logger.LogInformation("Rows affected: {Count}", rowsAffected);

                // Clear cache
                _context.ChangeTracker.Clear();

                // Check user AFTER
                var userAfter = await _context.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                _logger.LogInformation("AFTER: IsVerified={Verified}, IsActive={Active}",
                    userAfter?.IsEmailVerified, userAfter?.IsActive);

                return new
                {
                    database = dbConnection.Database,
                    rowsAffected = rowsAffected,
                    before = new
                    {
                        isEmailVerified = userBefore?.IsEmailVerified,
                        isActive = userBefore?.IsActive
                    },
                    after = new
                    {
                        isEmailVerified = userAfter?.IsEmailVerified,
                        isActive = userAfter?.IsActive
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DirectSqlUpdateTest ERROR");
                return new { error = ex.Message };
            }
        }
    }
}