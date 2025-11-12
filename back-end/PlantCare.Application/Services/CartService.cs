using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.Cart;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class CartService : ICartService
    {
        private readonly PlantCareContext _context;

        public CartService(PlantCareContext context)
        {
            _context = context;
        }

        public async Task<CartDTO> GetCartByUserIdAsync(int userId)
        {
            var cartItems = await _context.CartItems
                .Include(ci => ci.Product) // Join bảng Product
                .Where(ci => ci.UserId == userId)
                .Select(ci => new CartItemDTO
                {
                    ProductId = ci.ProductId,
                    ProductName = ci.Product.ProductName,
                    ImageUrl = ci.Product.ImageUrl,
                    Price = ci.Product.Price,
                    Quantity = ci.Quantity ?? 1 
                })
                .ToListAsync();

            return new CartDTO { Items = cartItems };
        }

        public async Task<CartDTO> AddItemToCartAsync(int userId, AddItemToCartDTO dto)
        {
            var product = await _context.Products.FindAsync(dto.ProductId);

            if (product == null)
                throw new KeyNotFoundException("Sản phẩm không tồn tại.");

            // Xử lý Stock (int?)
            if ((product.Stock ?? 0) < dto.Quantity)
                throw new InvalidOperationException("Số lượng sản phẩm không đủ.");

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == dto.ProductId);

            if (cartItem != null)
            {
                // Nếu đã có, tăng số lượng
                cartItem.Quantity = (cartItem.Quantity ?? 0) + dto.Quantity;
                if ((product.Stock ?? 0) < cartItem.Quantity)
                    throw new InvalidOperationException("Số lượng sản phẩm trong kho không đủ.");
            }
            else
            {
                // Nếu chưa có, tạo mới
                cartItem = new CartItem
                {
                    UserId = userId, // Liên kết trực tiếp UserId
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            return await GetCartByUserIdAsync(userId);
        }

        public async Task<CartDTO> UpdateItemQuantityAsync(int userId, UpdateCartItemDTO dto)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == dto.ProductId);

            if (cartItem == null)
                throw new KeyNotFoundException("Sản phẩm không có trong giỏ hàng.");

            if (dto.NewQuantity <= 0)
            {
                // Nếu số lượng <= 0, xóa
                return await RemoveItemFromCartAsync(userId, dto.ProductId);
            }

            if ((cartItem.Product.Stock ?? 0) < dto.NewQuantity)
                throw new InvalidOperationException("Số lượng sản phẩm trong kho không đủ.");

            cartItem.Quantity = dto.NewQuantity;
            await _context.SaveChangesAsync();
            return await GetCartByUserIdAsync(userId);
        }

        public async Task<CartDTO> RemoveItemFromCartAsync(int userId, int productId)
        {
            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);

            if (cartItem != null)
            {
                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();
            }

            return await GetCartByUserIdAsync(userId);
        }

        public async Task<bool> ClearCartAsync(int userId)
        {
            var cartItems = _context.CartItems.Where(ci => ci.UserId == userId);

            if (cartItems.Any())
            {
                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();
            }
            return true;
        }
    }
}
