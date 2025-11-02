// Path: PlantCare.API/Controllers/UserPlantController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.UserPlant;
using PlantCare.Application.Interfaces;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserPlantController : ControllerBase
    {
        private readonly IUserPlantService _userPlantService;

        public UserPlantController(IUserPlantService userPlantService)
        {
            _userPlantService = userPlantService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

        /// <summary>
        /// Lấy danh sách cây của user
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetUserPlants()
        {
            try
            {
                var userId = GetUserId();
                var plants = await _userPlantService.GetUserPlantsAsync(userId);
                return Ok(new { success = true, data = plants });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy chi tiết một cây
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserPlantDetail(int id)
        {
            try
            {
                var userId = GetUserId();
                var plant = await _userPlantService.GetUserPlantDetailAsync(id, userId);

                if (plant == null)
                    return NotFound(new { success = false, message = "Không tìm thấy cây" });

                return Ok(new { success = true, data = plant });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Thêm cây mới vào danh sách
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> AddUserPlant([FromBody] CreateUserPlantDTO dto)
        {
            try
            {
                var userId = GetUserId();
                var plant = await _userPlantService.AddUserPlantAsync(userId, dto);
                return CreatedAtAction(nameof(GetUserPlantDetail), new { id = plant.UserPlantID },
                    new { success = true, data = plant, message = "Thêm cây thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật thông tin cây
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateUserPlant([FromBody] UpdateUserPlantDTO dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _userPlantService.UpdateUserPlantAsync(userId, dto);

                if (!result)
                    return NotFound(new { success = false, message = "Không tìm thấy cây hoặc không có quyền cập nhật" });

                return Ok(new { success = true, message = "Cập nhật thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa cây khỏi danh sách
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserPlant(int id)
        {
            try
            {
                var userId = GetUserId();
                var result = await _userPlantService.DeleteUserPlantAsync(id, userId);

                if (!result)
                    return NotFound(new { success = false, message = "Không tìm thấy cây hoặc không có quyền xóa" });

                return Ok(new { success = true, message = "Xóa cây thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật lần tưới nước
        /// </summary>
        [HttpPost("{id}/water")]
        public async Task<IActionResult> UpdateWatering(int id, [FromBody] UpdateCareDTO dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _userPlantService.UpdateWateringAsync(id, userId, dto.Date);

                if (!result)
                    return NotFound(new { success = false, message = "Không tìm thấy cây" });

                return Ok(new { success = true, message = "Đã cập nhật lịch tưới nước" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật lần bón phân
        /// </summary>
        [HttpPost("{id}/fertilize")]
        public async Task<IActionResult> UpdateFertilizing(int id, [FromBody] UpdateCareDTO dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _userPlantService.UpdateFertilizingAsync(id, userId, dto.Date);

                if (!result)
                    return NotFound(new { success = false, message = "Không tìm thấy cây" });

                return Ok(new { success = true, message = "Đã cập nhật lịch bón phân" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật trạng thái cây (Đang sống, Chết, Đã tặng/bán)
        /// </summary>
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdatePlantStatus(int id, [FromBody] UpdateStatusDTO dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _userPlantService.UpdatePlantStatusAsync(id, userId, dto.Status);

                if (!result)
                    return NotFound(new { success = false, message = "Không tìm thấy cây" });

                return Ok(new { success = true, message = "Đã cập nhật trạng thái" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lọc cây theo trạng thái
        /// </summary>
        [HttpGet("status/{status}")]
        public async Task<IActionResult> GetPlantsByStatus(string status)
        {
            try
            {
                var userId = GetUserId();
                var plants = await _userPlantService.GetPlantsByStatusAsync(userId, status);
                return Ok(new { success = true, data = plants });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Tìm kiếm cây theo tên
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> SearchUserPlants([FromQuery] string term)
        {
            try
            {
                var userId = GetUserId();
                var plants = await _userPlantService.SearchUserPlantsAsync(userId, term);
                return Ok(new { success = true, data = plants });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Thống kê cây của user
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var userId = GetUserId();
                var stats = await _userPlantService.GetUserPlantStatisticsAsync(userId);
                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}