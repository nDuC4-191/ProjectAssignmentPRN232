using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.Feedback;
using PlantCare.Application.Interfaces;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbacksController : BaseController
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbacksController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        /// Gửi đánh giá cho một sản phẩm (yêu cầu đã mua)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddFeedback([FromBody] CreateFeedbackDTO dto)
        {
            var userId = GetCurrentUserId();
            try
            {
                var feedback = await _feedbackService.AddFeedbackAsync(userId, dto);
                return Ok(feedback);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
