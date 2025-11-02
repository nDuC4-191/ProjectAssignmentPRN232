using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.UserDADTO;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class UserDAService : IUserDAService
    {
        private readonly PlantCareContext _context;

        public UserDAService(PlantCareContext context)
        {
            _context = context;
        }

        public async Task<List<UserDADto>> GetAllAsync()
        {
            return await _context.Users
                .Select(u => new UserDADto
                {
                    UserID = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Role = u.Role,
                    IsActive = u.IsActive ?? false,              // nếu null → false
                    CreatedAt = u.CreatedAt ?? DateTime.MinValue // nếu null → 01/01/0001
                })
                .ToListAsync();
        }

        public async Task<UserDADto> GetByIdAsync(int id)
        {
            var u = await _context.Users.FindAsync(id);
            if (u == null) return null;
            return new UserDADto
            {
                UserID = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role,
                IsActive = u.IsActive ?? false,
                CreatedAt = u.CreatedAt ?? DateTime.MinValue
            };
        }

        public async Task<bool> UpdateRoleAsync(int userId, string role)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Role = role;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetActiveAsync(int userId, bool isActive)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsActive = isActive;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
