using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.OrderDADTO
{
    public class OrderListDto
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? PaymentMethod { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? Status { get; set; }
        public int TotalItems { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
