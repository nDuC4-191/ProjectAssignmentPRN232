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

        public async Task<bool> RegisterAsync(RegisterDTO model)
        {
            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
                return false;

            string token = Guid.NewGuid().ToString("N");

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
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddMinutes(30),
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            await SendVerificationEmail(user.FullName, user.Email, token);

            return true;
        }

        public async Task<(bool Success, string Message, string? Token)> LoginAsync(LoginDTO model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
                return (false, "Tài khoản không tồn tại.", null);

            if (!BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                return (false, "Mật khẩu không chính xác.", null);

            if (user.IsEmailVerified != true)
                return (false, "EMAIL_NOT_VERIFIED", null);

            if (user.IsActive != true)
                return (false, "Tài khoản chưa được kích hoạt.", null);

            string token = GenerateJwtToken(user);
            return (true, "Đăng nhập thành công!", token);
        }

        public async Task<(bool Success, string Message)> VerifyEmailAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return (false, "Token không hợp lệ.");

            var decoded = Uri.UnescapeDataString(token).Trim();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.EmailVerificationToken == decoded);

            if (user == null)
                return (false, "Token không tồn tại hoặc đã được sử dụng.");

            if (user.EmailVerificationTokenExpiry == null || user.EmailVerificationTokenExpiry < DateTime.UtcNow)
                return (false, "TOKEN_EXPIRED");

            user.IsEmailVerified = true;
            user.IsActive = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return (true, "Xác minh email thành công.");
        }

        public async Task<(bool Success, string Message)> ResendVerifyEmailAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return (false, "Email không tồn tại.");

            if (user.IsEmailVerified == true)
                return (true, "Email đã được xác minh.");

            string token = Guid.NewGuid().ToString("N");
            user.EmailVerificationToken = token;
            user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddMinutes(30);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            await SendVerificationEmail(user.FullName, user.Email, token);

            return (true, "Đã gửi lại email xác minh!");
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == email);
            if (user == null) return false;

            string token = Guid.NewGuid().ToString("N");
            user.EmailVerificationToken = token;
            user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddMinutes(30);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            string resetUrl = $"{_config["AppSettings:ClientUrl"]}/reset-password?token={Uri.EscapeDataString(token)}";
            string html = $@"
<h2>Khôi phục mật khẩu PlantCare</h2>
<p>Xin chào <b>{user.FullName}</b>,</p>
<p>Nhấn để đặt lại mật khẩu:</p>
<p><a href='{resetUrl}'>ĐẶT LẠI MẬT KHẨU</a></p>";

            await _emailService.SendEmailAsync(email, "Khôi phục mật khẩu - PlantCare", html);
            return true;
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var decoded = Uri.UnescapeDataString(token).Trim();
            var user = await _context.Users.FirstOrDefaultAsync(x => x.EmailVerificationToken == decoded);
            if (user == null) return false;

            if (user.EmailVerificationTokenExpiry == null || user.EmailVerificationTokenExpiry < DateTime.UtcNow)
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

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

        private async Task SendVerificationEmail(string fullName, string email, string token)
        {
            string verifyUrl = $"{_config["AppSettings:ClientUrl"]}/verify-email?token={Uri.EscapeDataString(token)}";
            string html = $@"
<h2>Xác minh tài khoản PlantCare 🌿</h2>
<p>Xin chào <b>{fullName}</b>,</p>
<p>Nhấn vào nút bên dưới để xác minh tài khoản:</p>
<p><a href='{verifyUrl}'>XÁC MINH TÀI KHOẢN</a></p>";

            await _emailService.SendEmailAsync(email, "Xác minh tài khoản - PlantCare", html);
        }

        // ================= IMPLEMENTATION FIX =================
        public async Task<User?> GetUserByEmailAsync(string email)
            => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        public Task<bool> LogoutAsync(int userId)
        {
            _logger.LogInformation("User {UserId} logged out", userId);
            return Task.FromResult(true);
        }
    }
}
