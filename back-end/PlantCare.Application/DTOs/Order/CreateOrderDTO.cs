using PlantCare.Application.DTOs.OrderDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.Order
{
    // DTO client gửi lên khi bấm "Thanh toán"
    public class CreateOrderDTO
    {
        public ShippingAddressDTO ShippingAddress { get; set; }
        public string PaymentMethod { get; set; } // "COD", "VNPAY", "MOMO"
        public string Notes { get; set; }
    }
}
