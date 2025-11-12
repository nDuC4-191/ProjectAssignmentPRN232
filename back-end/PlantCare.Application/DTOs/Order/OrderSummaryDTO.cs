using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.Order
{
    // DTO tóm tắt đơn (cho trang Lịch sử mua )
    public class OrderSummaryDTO
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
