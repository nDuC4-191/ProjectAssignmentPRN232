using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.OrderDTO
{
    // DTO chi tiết đầy đủ 1 order (trả về sau khi đặt)
    public class OrderDTO
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } // "Pending", "Processing", "Shipped", "Completed"
        public decimal TotalAmount { get; set; }
        public ShippingAddressDTO ShippingAddress { get; set; }
        public List<OrderItemDTO> OrderItems { get; set; }
    }
}
