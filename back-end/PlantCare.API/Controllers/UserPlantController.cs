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
        private readonly IProductDAService _productService;

        public UserPlantController(
            IUserPlantService userPlantService,
            IProductDAService productService)
        {
            _userPlantService = userPlantService;
            _productService = productService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("Token không hợp lệ hoặc đã hết hạn.");
            if (!int.TryParse(userIdClaim, out int userId))
                throw new UnauthorizedAccessException("UserId trong token không hợp lệ.");
            return userId;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetUserPlants()
        {
            try
            {
                var userId = GetUserId();
                var plants = await _userPlantService.GetUserPlantsAsync(userId);
                return Ok(new { success = true, data = plants });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetUserPlantDetail(int id)
        {
            try
            {
                var userId = GetUserId();
                var plant = await _userPlantService.GetUserPlantDetailAsync(id, userId);

                if (plant == null)
                    return NotFound(new { success = false, message = "Không tìm thấy cây hoặc không có quyền truy cập." });

                return Ok(new { success = true, data = plant });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }

        /// <summary>
        /// POST api/userplant - Thêm cây mới (⭐ FIX: Dùng đúng property names)
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddUserPlant([FromBody] CreateUserPlantDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ.", errors = ModelState });

                var userId = GetUserId();
                var plant = await _userPlantService.AddUserPlantAsync(userId, dto);

                // ⭐ Lấy thông tin Product
                var product = await _productService.GetByIdAsync(dto.ProductID);

                // ⭐ FIX: Dùng đúng tên property từ UserPlantDTO
                var response = new
                {
                    userPlantID = plant.UserPlantID,
                    productID = plant.ProductID,
                    productName = product?.ProductName ?? "Không rõ tên", // ⭐ Tên cây
                    nickname = plant.Nickname,
                    plantedDate = plant.PlantedDate,
                    notes = plant.Notes,
                    status = plant.Status,
                    lastWatered = plant.LastWatered,        // ⭐ FIX: LastWatered không phải LastWateredDate
                    lastFertilized = plant.LastFertilized   // ⭐ FIX: LastFertilized không phải LastFertilizedDate
                };

                return CreatedAtAction(
                    nameof(GetUserPlantDetail),
                    new { id = plant.UserPlantID },
                    new { success = true, data = response, message = "Thêm cây thành công." }
                );
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUserPlant([FromBody] UpdateUserPlantDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ.", errors = ModelState });

                var userId = GetUserId();
                var result = await _userPlantService.UpdateUserPlantAsync(userId, dto);

                if (!result)
                    return NotFound(new { success = false, message = "Không tìm thấy cây hoặc không có quyền cập nhật." });

                return Ok(new { success = true, message = "Cập nhật thành công." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUserPlant(int id)
        {
            try
            {
                var userId = GetUserId();
                var result = await _userPlantService.DeleteUserPlantAsync(id, userId);

                if (!result)
                    return NotFound(new { success = false, message = "Không tìm thấy cây hoặc không có quyền xóa." });

                return Ok(new { success = true, message = "Xóa cây thành công." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpPost("{id}/water")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateWatering(int id, [FromBody] UpdateCareDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ.", errors = ModelState });

                var userId = GetUserId();
                var result = await _userPlantService.UpdateWateringAsync(id, userId, dto.Date);

                if (!result)
                    return NotFound(new { success = false, message = "Không tìm thấy cây." });

                return Ok(new { success = true, message = "Đã cập nhật lịch tưới nước." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{id}/fertilize")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateFertilizing(int id, [FromBody] UpdateCareDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ.", errors = ModelState });

                var userId = GetUserId();
                var result = await _userPlantService.UpdateFertilizingAsync(id, userId, dto.Date);

                if (!result)
                    return NotFound(new { success = false, message = "Không tìm thấy cây." });

                return Ok(new { success = true, message = "Đã cập nhật lịch bón phân." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePlantStatus(int id, [FromBody] UpdateStatusDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ.", errors = ModelState });

                var userId = GetUserId();
                var result = await _userPlantService.UpdatePlantStatusAsync(id, userId, dto.Status);

                if (!result)
                    return NotFound(new { success = false, message = "Không tìm thấy cây." });

                return Ok(new { success = true, message = "Đã cập nhật trạng thái." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("status/{status}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
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
                return StatusCode(500, new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchUserPlants([FromQuery] string term)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(term))
                    return BadRequest(new { success = false, message = "Từ khóa tìm kiếm không được để trống." });

                var userId = GetUserId();
                var plants = await _userPlantService.SearchUserPlantsAsync(userId, term);
                return Ok(new { success = true, data = plants });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet("statistics")]
        [ProducesResponseType(StatusCodes.Status200OK)]
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
                return StatusCode(500, new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }
    }
}