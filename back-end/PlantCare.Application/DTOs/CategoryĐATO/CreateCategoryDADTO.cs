using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.Category
{
    public class CreateCategoryDTO
    {
        [Required(ErrorMessage = "Tên danh mục là bắt buộc.")]
        [StringLength(100)]
        public string CategoryName { get; set; }
        public string Description { get; set; }
        public int? ParentId { get; set; }
    }
}
