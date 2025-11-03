using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.UserProfile;
using PlantCare.Application.Interfaces;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _profileService;

        public UserProfileController(IUserProfileService profileService)
        {
            _profileService = profileService;
        }

        private int GetUserIdFromToken()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new Exception("User ID claim missing in token");

            return int.Parse(userId);
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserIdFromToken();
            var profile = await _profileService.GetProfileAsync(userId);

            if (profile == null) return NotFound("User not found");

            return Ok(profile);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromForm] ProfileDTO request)
        {
            var userId = GetUserIdFromToken();
            var updated = await _profileService.UpdateProfileAsync(userId, request);

            if (!updated)
                return BadRequest("Update failed");

            return Ok("Profile updated successfully");

        }
    }
}
