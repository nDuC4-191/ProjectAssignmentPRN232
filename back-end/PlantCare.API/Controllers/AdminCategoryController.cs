using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.Category;
using PlantCare.Application.Interfaces;

namespace PlantCare.API.Controllers
{
    [ApiController]
    [Route("api/admin/categories")]
    [Authorize(Roles = "Admin,Staff")]
    public class AdminCategoryController : ControllerBase
    {
        private readonly ICategoryDAService _categoryService;
        private readonly ILogger<AdminCategoryController> _logger;

        public AdminCategoryController(ICategoryDAService categoryService, ILogger<AdminCategoryController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllCategoriesAsync();
                return Ok(new { success = true, data = categories });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAll categories error");
                return StatusCode(500, new { success = false, message = "Lỗi server" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDTO dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors });
            }

            try
            {
                var newCategory = await _categoryService.CreateCategoryAsync(dto);
                return CreatedAtAction(nameof(GetCategoryById), new { id = newCategory.CategoryId }, new { success = true, data = newCategory });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create category error");
                return BadRequest(new { success = false, message = "Lỗi khi tạo danh mục: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDADTO dto)
        {
            if (id != dto.CategoryId)
                return BadRequest(new { success = false, message = "ID không khớp" });

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors });
            }

            try
            {
                await _categoryService.UpdateCategoryAsync(dto);
                return Ok(new { success = true, message = "Cập nhật thành công" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { success = false, message = "Không tìm thấy danh mục" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update category {Id} error", id);
                return StatusCode(500, new { success = false, message = "Lỗi server" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Chỉ Admin
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                await _categoryService.DeleteCategoryAsync(id);
                return Ok(new { success = true, message = "Xóa thành công" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { success = false, message = "Không tìm thấy danh mục" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Delete category {Id} error", id);
                return StatusCode(500, new { success = false, message = "Lỗi server" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);
                return Ok(new { success = true, data = category });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { success = false, message = "Không tìm thấy danh mục" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get category {Id} error", id);
                return StatusCode(500, new { success = false, message = "Lỗi server" });
            }
        }
    }
}