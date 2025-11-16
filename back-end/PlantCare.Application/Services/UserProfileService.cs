using PlantCare.Application.DTOs.UserProfile;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly PlantCareContext _context;

        public UserProfileService(PlantCareContext context)
        {
            _context = context;
        }

        public async Task<ProfileDTO?> GetProfileAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            return new ProfileDTO
            {
                FullName = user.FullName,
                Phone = user.Phone,
                Address = user.Address,
                AvatarUrl = user.AvatarUrl,
               
            };
        }

        public async Task<bool> UpdateProfileAsync(int userId, ProfileDTO profileDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.FullName = profileDto.FullName;
            user.Phone = profileDto.Phone;
            user.Address = profileDto.Address;
            user.AvatarUrl = profileDto.AvatarUrl;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}