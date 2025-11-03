using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.UserOrders
{
    public class OrderItemDTO
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; }
        public string ImageUrl { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
    }
    public class OrderDTO
    {
        public int OrderID { get; set; }
        public string Address { get; set; }
        public string PaymentMethod { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDTO> Items { get; set; }
    }

    public class CreateOrderDTO
    {
        public string Address { get; set; }
        public string PaymentMethod { get; set; }
        public List<OrderProductDTO> Products { get; set; }
    }

    public class OrderProductDTO
    {
        public int ProductID { get; set; }
        public int Quantity { get; set; }
    }
}
