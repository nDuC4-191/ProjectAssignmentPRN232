using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.OrderDTO
{
    //DTO cho địa chỉ giao hàng khi checkout
    public class ShippingAddressDTO
    {
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string AddressLine { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
    }
}
