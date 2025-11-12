using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.DTOs.Cart
{
    //DTO cả giỏ hàng (trả cho client)
    public class CartDTO
    {
        public List<CartItemDTO> Items { get; set; } = new List<CartItemDTO>();
        public decimal GrandTotal => Items.Sum(item => item.TotalPrice);
        public int TotalItems => Items.Sum(item => item.Quantity);
    }
}
