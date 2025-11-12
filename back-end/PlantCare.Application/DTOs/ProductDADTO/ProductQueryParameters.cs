using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.ProductDADTO
{
    public class ProductQueryParameters
    {
        // Task: Tìm kiếm sản phẩm theo tên
        public string? Search { get; set; }

        // Task: Lọc sản phẩm theo Loại cây (Category)
        public int? CategoryId { get; set; }

        // Task: Lọc sản phẩm theo Mức giá
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }

        // Task: Lọc sản phẩm theo Độ khó
        public string? Difficulty { get; set; } // "Dễ", "Trung bình", "Khó"

        // Task: Lọc sản phẩm theo Nhu cầu ánh sáng / nước
        public string? LightRequirement { get; set; } // "Thấp", "Vừa", "Cao"
        public string? WaterRequirement { get; set; } // "Ít", "Vừa", "Nhiều"

        // Paging (Phân trang - Rất nên có)
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
