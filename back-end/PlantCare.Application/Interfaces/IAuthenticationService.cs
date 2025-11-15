using PlantCare.Application.DTOs.Authentication;
using PlantCare.Infrastructure.Models;

namespace PlantCare.Application.Interfaces
{
    public interface IAuthenticationService
    {
        Task<bool> RegisterAsync(RegisterDTO model);
        Task<(bool Success, string Message, string? Token)> LoginAsync(LoginDTO model);
        Task<(bool Success, string Message)> VerifyEmailAsync(string token);
        Task<(bool Success, string Message)> ResendVerifyEmailAsync(string email);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(string token, string newPassword);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO dto);
        Task<bool> LogoutAsync(int userId);  // FIXED
        Task<User?> GetUserByEmailAsync(string email); // FIXED
        Task<object> DirectSqlUpdateTestAsync(int userId);
    }
}
