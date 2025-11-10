using PlantCare.Application.DTOs.Authentication;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface IAuthenticationService
    {
        Task<string?> RegisterAsync(RegisterDTO model);
        Task<string?> LoginAsync(LoginDTO model);
        Task<bool> ForgotPasswordAsync(string email);
        Task<User?> GetUserByEmailAsync(string email);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO dto);
        Task<bool> LogoutAsync(int userId);
    }
}
