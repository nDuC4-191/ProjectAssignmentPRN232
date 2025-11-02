using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.Category
{
    public class CategoryDADTO
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Description { get; set; }
        // Sửa: ParentID -> ParentId
        public int? ParentId { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
