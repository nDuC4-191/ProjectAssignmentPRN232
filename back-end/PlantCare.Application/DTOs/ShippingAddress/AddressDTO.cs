using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.ShippingAddress
{
    public class AddressDTO
    {
        public int AddressID { get; set; }
        public string RecipientName { get; set; }
        public string Phone { get; set; }
        public string AddressLine { get; set; }
        public bool? IsDefault { get; set; }
    }
}
