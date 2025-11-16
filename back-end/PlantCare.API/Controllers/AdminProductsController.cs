using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.ProductDADTO;
using PlantCare.Application.Interfaces;

namespace PlantCare.API.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin,Staff")]
public class AdminProductsController : ControllerBase
{
    private readonly IProductDAService _productService;
    private readonly ILogger<AdminProductsController> _logger;

    public AdminProductsController(IProductDAService productService, ILogger<AdminProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    // GET: api/admin/products
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var products = await _productService.GetAllAsync();
            return Ok(new { success = true, data = products });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách sản phẩm");
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    // GET: api/admin/products/filter?search=cây&categoryId=1&minPrice=100000
    [HttpGet("filter")]
    public async Task<IActionResult> GetFiltered([FromQuery] ProductQueryParameters query)
    {
        try
        {
            var products = await _productService.GetProductsAsync(query);
            return Ok(new { success = true, data = products });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lọc sản phẩm: {@Query}", query);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    // GET: api/admin/products/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm" });

            return Ok(new { success = true, data = product });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy sản phẩm ID {Id}", id);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    // POST: api/admin/products → application/json
    [HttpPost]
    [Consumes("application/json")]
    public async Task<IActionResult> Create([FromBody] CreateUpdateProductDADto dto)
    {
        if (dto == null)
            return BadRequest(new { success = false, message = "Dữ liệu rỗng" });

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
            var id = await _productService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, new { success = true, data = new { id } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tạo sản phẩm: {@Dto} | Inner: {Inner}", dto, ex.InnerException?.Message);
            return StatusCode(500, new
            {
                success = false,
                message = "Lỗi khi tạo sản phẩm",
                detail = ex.InnerException?.Message ?? ex.Message
            });
        }
    }

    // PUT: api/admin/products/5 → application/json
    [HttpPut("{id:int}")]
    [Consumes("application/json")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateProductDADto dto)
    {
        if (dto == null)
            return BadRequest(new { success = false, message = "Dữ liệu rỗng" });

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
            var success = await _productService.UpdateAsync(id, dto);
            if (!success)
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm" });

            return Ok(new { success = true, message = "Cập nhật thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi cập nhật sản phẩm ID {Id}: {@Dto}", id, dto);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    // DELETE: api/admin/products/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success = await _productService.DeleteAsync(id);
            if (!success)
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm" });

            return Ok(new { success = true, message = "Xóa thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa sản phẩm ID {Id}", id);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }
}