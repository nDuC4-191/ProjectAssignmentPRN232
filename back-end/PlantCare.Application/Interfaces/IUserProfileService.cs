using PlantCare.Application.DTOs.UserProfile;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface IUserProfileService
    {
        Task<ProfileDTO?> GetProfileAsync(int userId);
        Task<bool> UpdateProfileAsync(int userId, ProfileDTO profileDto);
    }
}
