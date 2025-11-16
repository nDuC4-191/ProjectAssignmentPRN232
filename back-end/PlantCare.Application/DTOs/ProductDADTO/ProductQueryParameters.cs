using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace PlantCare.Application.DTOs.ProductDADTO;

/// <summary>
/// Tham số lọc sản phẩm
/// </summary>
public class ProductQueryParameters
{
    [JsonProperty("search")]
    public string? Search { get; set; }

    [JsonProperty("categoryId")]
    public int? CategoryId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Giá phải ≥ 0")]
    [JsonProperty("minPrice")]
    public decimal? MinPrice { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Giá phải ≥ 0")]
    [JsonProperty("maxPrice")]
    public decimal? MaxPrice { get; set; }

    [JsonProperty("difficulty")]
    public string? Difficulty { get; set; }

    [JsonProperty("lightRequirement")]
    public string? LightRequirement { get; set; }

    [JsonProperty("waterRequirement")]
    public string? WaterRequirement { get; set; }

    // Phân trang (nếu cần)
    [JsonProperty("pageNumber")]
    public int? PageNumber { get; set; }

    [JsonProperty("pageSize")]
    public int? PageSize { get; set; }
}