using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.Interfaces;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategorysController : ControllerBase
    {
        private readonly ICategoryDAService _categoryService;

        public CategorysController(ICategoryDAService categoryService)
        {
            _categoryService = categoryService;
        }

        /// Task: Xem danh mục sản phẩm (cây trồng, chậu, đất...)
        /// Lấy tất cả danh mục đang có.
        /// <returns>Danh sách các danh mục</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        // Lấy chi tiết một danh mục bằng ID.
        /// <param name="id">Category ID</param>
        /// <returns>Chi tiết danh mục</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);
                return Ok(category);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
