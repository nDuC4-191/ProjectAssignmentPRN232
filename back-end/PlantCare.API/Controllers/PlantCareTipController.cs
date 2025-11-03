using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.Interfaces;
using PlantCare.Application.DTOs.PlantCare;

namespace PlantCare.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlantCareTipController : ControllerBase
    {
        private readonly IPlantCareTipService _tipService;
        private readonly ILogger<PlantCareTipController> _logger;

        public PlantCareTipController(
            IPlantCareTipService tipService,
            ILogger<PlantCareTipController> logger)
        {
            _tipService = tipService;
            _logger = logger;
        }

        /// <summary>
        /// GET: api/PlantCareTip/plants
        /// Lấy danh sách tất cả cây có wiki (cho sidebar)
        /// </summary>
        [HttpGet("plants")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllPlants()
        {
            try
            {
                var plants = await _tipService.GetAllPlantsWithTipsAsync();
                return Ok(new
                {
                    success = true,
                    data = plants,
                    count = plants.Count()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting plants with tips");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi tải danh sách cây",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// GET: api/PlantCareTip/product/{productId}
        /// Lấy tất cả tips của 1 cây (chi tiết wiki)
        /// </summary>
        [HttpGet("product/{productId}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetTipsByProduct(int productId)
        {
            try
            {
                var tips = await _tipService.GetTipsByProductIdAsync(productId);

                if (!tips.Any())
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Chưa có hướng dẫn chăm sóc cho cây này"
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = tips,
                    productId = productId,
                    count = tips.Count()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting tips for product {productId}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi tải hướng dẫn",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// GET: api/PlantCareTip/{id}
        /// Lấy chi tiết 1 tip
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var tip = await _tipService.GetByIdAsync(id);

                if (tip == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy tip"
                    });
                }

                return Ok(new { success = true, data = tip });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting tip {id}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi tải tip",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// GET: api/PlantCareTip/search?keyword=tuoi
        /// Tìm kiếm tips
        /// </summary>
        [HttpGet("search")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(keyword))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Vui lòng nhập từ khóa tìm kiếm"
                    });
                }

                var tips = await _tipService.SearchTipsAsync(keyword);
                return Ok(new
                {
                    success = true,
                    data = tips,
                    keyword = keyword,
                    count = tips.Count()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error searching tips with keyword: {keyword}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi tìm kiếm",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// POST: api/PlantCareTip
        /// Thêm tip mới (Admin only)
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreatePlantCareTipDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = ModelState
                    });
                }

                var tip = await _tipService.CreateAsync(dto);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id = tip.TipId },
                    new
                    {
                        success = true,
                        data = tip,
                        message = "Thêm tip thành công"
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tip");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi thêm tip",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// PUT: api/PlantCareTip/{id}
        /// Cập nhật tip (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePlantCareTipDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = ModelState
                    });
                }

                var success = await _tipService.UpdateAsync(id, dto);

                if (!success)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy tip"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật tip thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating tip {id}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi cập nhật tip",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// DELETE: api/PlantCareTip/{id}
        /// Xóa tip (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _tipService.DeleteAsync(id);

                if (!success)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy tip"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Xóa tip thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting tip {id}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi xóa tip",
                    error = ex.Message
                });
            }
        }
    }
}