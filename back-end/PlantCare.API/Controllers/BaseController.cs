using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{
    [ApiController]
    public abstract class BaseController : ControllerBase
    {
        // Lấy UserId của người dùng đã được xác thực từ Token
        protected int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("Không thể xác định người dùng. Token không hợp lệ hoặc thiếu.");
            }
            return int.Parse(userIdClaim.Value);
        }
    }
}
