using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.Category;
using PlantCare.Application.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace PlantCare.API.Controllers
{
    [ApiController]
    [Route("api/admin/categories")]
    /*[Authorize(Roles = "Admin,Staff")]*/
    public class AdminCategoryController : Controller
    {

        private readonly ICategoryDAService _categoryService;

        public AdminCategoryController(ICategoryDAService categoryService)
        {
            _categoryService = categoryService;
        }

        // --- GET: Lấy danh sách ---
        [HttpGet]
        public async Task<ActionResult<List<CategoryDADTO>>> GetAllCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        // --- POST: Tạo mới ---
        [HttpPost]
        public async Task<ActionResult<CategoryDADTO>> CreateCategory([FromBody] CreateCategoryDTO dto)
        {
            try
            {
                var newCategory = await _categoryService.CreateCategoryAsync(dto);
                return CreatedAtAction(nameof(GetCategoryById), new { id = newCategory.CategoryId }, newCategory);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Lỗi khi tạo danh mục: " + ex.Message });
            }
        }

        // --- PUT: Cập nhật ---
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDADTO dto)
        {
            if (id != dto.CategoryId) return BadRequest("ID trong URL và ID trong body không khớp.");

            try
            {
                await _categoryService.UpdateCategoryAsync(dto);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Lỗi khi cập nhật danh mục: " + ex.Message });
            }
        }

        // --- DELETE: Xóa ---
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                await _categoryService.DeleteCategoryAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Lỗi khi xóa danh mục: " + ex.Message });
            }
        }

        // --- GET by ID ---
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDADTO>> GetCategoryById(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);
                return Ok(category);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
