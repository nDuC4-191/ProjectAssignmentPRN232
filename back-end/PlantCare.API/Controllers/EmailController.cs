using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.Interfaces;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public EmailController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        // Test Email
        [HttpGet("test-email")]
        public async Task<IActionResult> TestEmail()
        {
            await _emailService.SendEmailAsync(
                "your-email@gmail.com",
                "Test gửi mail",
                "<h2>Gửi mail thành công từ PlantCare!</h2>"
            );

            return Ok("Đã gửi email!");
        }
    }
}
