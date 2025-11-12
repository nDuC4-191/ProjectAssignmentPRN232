using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.Cart
{
    public class UpdateCartItemDTO
    {
        public int ProductId { get; set; }
        public int NewQuantity { get; set; }
    }
}
