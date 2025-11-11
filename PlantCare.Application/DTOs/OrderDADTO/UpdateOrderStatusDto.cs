using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.OrderDADTO
{
    public class UpdateOrderStatusDto
    {
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression("^(Pending|Processing|Shipping|Delivered|Completed|Cancelled)$",
            ErrorMessage = "Invalid status. Allowed values: Pending, Processing, Shipping, Delivered, Completed, Cancelled")]
        public string Status { get; set; } = string.Empty;
    }
}
