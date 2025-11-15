
using PlantCare.Application.DTOs.UserProfile;

public interface IUserProfileService
{
    Task<ProfileDTO?> GetProfileAsync(int userId);
    Task<bool> UpdateProfileAsync(int userId, ProfileDTO profileDto);
}