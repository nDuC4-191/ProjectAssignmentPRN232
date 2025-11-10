using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.ProductDADTO
{
    public class ProductDADto
    {
        public int ProductID { get; set; }
        public int CategoryID { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int? Stock { get; set; }
        public string Difficulty { get; set; }
        public string LightRequirement { get; set; }
        public string WaterRequirement { get; set; }
        public string SoilType { get; set; }
    }

    public class CreateUpdateProductDADto
    {
        public int CategoryID { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string Difficulty { get; set; }
        public string LightRequirement { get; set; }
        public string WaterRequirement { get; set; }
        public string SoilType { get; set; }
    }
}
