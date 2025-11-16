using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace PlantCare.Application.DTOs.ProductDADTO;

/// <summary>
/// Dùng để tạo hoặc cập nhật sản phẩm
/// </summary>
public class CreateUpdateProductDADto
{
    [Required(ErrorMessage = "Danh mục là bắt buộc")]
    [JsonProperty("categoryId")]  // ← Map: categoryId → CategoryID
    public int CategoryID { get; set; }

    [Required(ErrorMessage = "Tên sản phẩm là bắt buộc")]
    [JsonProperty("productName")]
    public string ProductName { get; set; } = null!;

    [JsonProperty("description")]
    public string? Description { get; set; }

    [Range(0, 1_000_000_000, ErrorMessage = "Giá phải từ 0 đến 1 tỷ")]
    [JsonProperty("price")]
    public decimal Price { get; set; }

    [JsonProperty("stock")]
    public int? Stock { get; set; }

    [JsonProperty("difficulty")]
    public string? Difficulty { get; set; }

    [JsonProperty("lightRequirement")]
    public string? LightRequirement { get; set; }

    [JsonProperty("waterRequirement")]
    public string? WaterRequirement { get; set; }

    [JsonProperty("soilType")]
    public string? SoilType { get; set; }

    [Url(ErrorMessage = "Link ảnh không hợp lệ")]
    [JsonProperty("imageUrl")]
    public string? ImageUrl { get; set; }
}