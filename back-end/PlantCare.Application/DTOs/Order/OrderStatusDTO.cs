using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.Order
{
    // DTO cho việc check status 
    public class OrderStatusDTO
    {
        public int OrderId { get; set; }
        public string CurrentStatus { get; set; }
        public DateTime LastUpdate { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
    }
}
