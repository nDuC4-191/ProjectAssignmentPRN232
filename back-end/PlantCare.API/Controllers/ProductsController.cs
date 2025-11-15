using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.ProductDADTO;
using PlantCare.Application.Interfaces;
using PlantCare.Application.Services;

namespace PlantCare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : BaseController
    {
        private readonly IProductDAService _productService;
        private readonly IFeedbackService _feedbackService;
        private readonly ICareSuggestionService _careSuggestionService; // (Code của Vinh)

        public ProductsController(IProductDAService productService, ICareSuggestionService careSuggestionService, IFeedbackService feedbackService)
        {
            _productService = productService;
            _careSuggestionService = careSuggestionService;
            _feedbackService = feedbackService;
        }


        // Task: Tìm kiếm và Lọc sản phẩm.
        // Lấy danh sách sản phẩm public, hỗ trợ lọc và phân trang.
        /// <param name="query">Các tham số lọc</param>
        /// Trả về danh sách sản phẩm đã lọc
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProducts([FromQuery] ProductQueryParameters query)
        {
            var pagedResult = await _productService.GetProductsAsync(query);
            return Ok(pagedResult);
        }

        // Task: Chi tiết sản phẩm.
        // Lấy chi tiết 1 sản phẩm bằng ID.
        /// <param name="id">Product ID</param>
        /// <returns>Chi tiết sản phẩm</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound("Sản phẩm không tồn tại.");
            }
            return Ok(product);
        }

        // Task: (Chi tiết sản phẩm) - Hướng dẫn chăm sóc.
        // Lấy hướng dẫn chăm sóc (Wiki) cho 1 sản phẩm (từ code của Vinh).
        /// <param name="id">Product ID</param>
        /// <returns>Hướng dẫn chăm sóc</returns>
        [HttpGet("{id}/care-guide")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCareGuide(int id)
        {
            var guide = await _careSuggestionService.GetPlantCareGuideAsync(id);
            if (guide == null)
            {
                return NotFound("Không tìm thấy hướng dẫn chăm sóc cho sản phẩm này.");
            }
            return Ok(guide);
        }

        // Task: Chi tiết sản phẩm (Đánh giá)
        [HttpGet("{id}/feedback")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProductFeedback(int id)
        {
            var feedback = await _feedbackService.GetFeedbackForProductAsync(id);
            return Ok(feedback);
        }

    }
}
