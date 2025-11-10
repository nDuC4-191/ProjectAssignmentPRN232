using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.CareSuggestion;
using PlantCare.Application.Interfaces;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CareSuggestionController : ControllerBase
    {
        private readonly ICareSuggestionService _careSuggestionService;

        public CareSuggestionController(ICareSuggestionService careSuggestionService)
        {
            _careSuggestionService = careSuggestionService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

        /// <summary>
        /// Lấy hướng dẫn chăm sóc của 1 cây (Wiki)
        /// </summary>
        [HttpGet("guide/{productId}")]
        public async Task<IActionResult> GetPlantCareGuide(int productId)
        {
            try
            {
                var guide = await _careSuggestionService.GetPlantCareGuideAsync(productId);

                if (guide == null)
                    return NotFound(new { success = false, message = "Không tìm thấy hướng dẫn cho cây này" });

                return Ok(new { success = true, data = guide });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy tất cả hướng dẫn chăm sóc (Wiki tất cả cây)
        /// </summary>
        [HttpGet("guides")]
        public async Task<IActionResult> GetAllCareGuides()
        {
            try
            {
                var guides = await _careSuggestionService.GetAllCareGuidesAsync();
                return Ok(new { success = true, data = guides, total = guides.Count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Tìm kiếm hướng dẫn chăm sóc bằng từ khóa
        /// </summary>
        [HttpGet("guides/search")]
        public async Task<IActionResult> SearchCareGuides([FromQuery] string term)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(term))
                    return BadRequest(new { success = false, message = "Vui lòng nhập từ khóa tìm kiếm" });

                var guides = await _careSuggestionService.SearchCareGuidesAsync(term);
                return Ok(new { success = true, data = guides, total = guides.Count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lọc hướng dẫn chăm sóc theo tên cây
        /// </summary>
        [HttpGet("guides/filter")]
        public async Task<IActionResult> FilterCareGuides([FromQuery] string plantName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(plantName))
                    return BadRequest(new { success = false, message = "Vui lòng nhập tên cây để lọc." });

                var guides = await _careSuggestionService.SearchCareGuidesAsync(plantName);
                return Ok(new { success = true, data = guides, total = guides.Count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Gợi ý cây phù hợp dựa vào điều kiện user (Có lưu lịch sử)
        /// </summary>
        [HttpPost("recommend")]
        [Authorize]
        public async Task<IActionResult> GetRecommendations([FromBody] UserConditionDTO condition)
        {
            try
            {
                var userId = GetUserId();
                var suggestions = await _careSuggestionService.GetSuggestionsForUserAsync(userId, condition);
                return Ok(new
                {
                    success = true,
                    data = suggestions,
                    message = $"Tìm thấy {suggestions.Count} cây phù hợp với điều kiện của bạn"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy danh sách cây được gợi ý (Không lưu lịch sử)
        /// </summary>
        [HttpPost("plants/recommend")]
        public async Task<IActionResult> GetRecommendedPlants([FromBody] UserConditionDTO condition)
        {
            try
            {
                var plants = await _careSuggestionService.GetRecommendedPlantsAsync(condition);
                return Ok(new
                {
                    success = true,
                    data = plants,
                    total = plants.Count,
                    message = $"Tìm thấy {plants.Count} loại cây phù hợp"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lịch sử gợi ý của user
        /// </summary>
        [HttpGet("history")]
        [Authorize]
        public async Task<IActionResult> GetSuggestionHistory()
        {
            try
            {
                var userId = GetUserId();
                var history = await _careSuggestionService.GetUserSuggestionHistoryAsync(userId);
                return Ok(new { success = true, data = history, total = history.Count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
