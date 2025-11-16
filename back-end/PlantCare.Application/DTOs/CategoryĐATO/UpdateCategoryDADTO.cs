using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace PlantCare.Application.DTOs.Category
{
    public class UpdateCategoryDADTO
    {
        [Required]
        [JsonProperty("categoryId")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Tên danh mục là bắt buộc.")]
        [StringLength(100)]
        [JsonProperty("categoryName")]
        public string CategoryName { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("parentId")]
        public int? ParentId { get; set; }
    }
}