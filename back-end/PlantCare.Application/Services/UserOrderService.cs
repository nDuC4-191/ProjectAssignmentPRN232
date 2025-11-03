using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.UserOrders;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class UserOrderService : IUserOrderService
    {
        private readonly PlantCareContext _context;

        public UserOrderService(PlantCareContext context)
        {
            _context = context;
        }
        public async Task<List<OrderDTO>> GetOrdersAsync(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderDTO
                {
                    OrderID = o.OrderId,
                    Address = o.Address,
                    PaymentMethod = o.PaymentMethod,
                    TotalAmount = o.TotalAmount ?? 0,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt ?? DateTime.Now,
                    Items = o.OrderDetails.Select(od => new OrderItemDTO
                    {
                        ProductID = od.ProductId,
                        ProductName = od.Product.ProductName,
                        ImageUrl = od.Product.ImageUrl,
                        UnitPrice = od.UnitPrice,
                        Quantity = od.Quantity ?? 0
                    }).ToList()
                }).ToListAsync();

            return orders;
        }
        public async Task<OrderDTO?> GetOrderDetailAsync(int userId, int orderId)
        {
            var order = await _context.Orders
                .Where(o => o.OrderId == orderId && o.UserId == userId)
                .Select(o => new OrderDTO
                {
                    OrderID = o.OrderId,
                    Address = o.Address,
                    PaymentMethod = o.PaymentMethod,
                    TotalAmount = o.TotalAmount ?? 0,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt ?? DateTime.Now,
                    Items = o.OrderDetails.Select(od => new OrderItemDTO
                    {
                        ProductID = od.ProductId,
                        ProductName = od.Product.ProductName,
                        ImageUrl = od.Product.ImageUrl,
                        UnitPrice = od.UnitPrice,
                        Quantity = od.Quantity ?? 0
                    }).ToList()
                }).FirstOrDefaultAsync();

            return order;
        }

        public async Task<int> CreateOrderAsync(int userId, CreateOrderDTO dto)
        {
            decimal total = 0;

            foreach (var p in dto.Products)
            {
                var product = await _context.Products.FindAsync(p.ProductID);
                if (product == null) continue;

                total += product.Price * p.Quantity;
            }

            var order = new Order
            {
                UserId = userId,
                Address = dto.Address,
                PaymentMethod = dto.PaymentMethod,
                TotalAmount = total,
                Status = "Processing",
                CreatedAt = DateTime.UtcNow
            };

            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();

            foreach (var p in dto.Products)
            {
                var product = await _context.Products.FindAsync(p.ProductID);
                if (product == null) continue;

                await _context.OrderDetails.AddAsync(new OrderDetail
                {
                    OrderId = order.OrderId,
                    ProductId = p.ProductID,
                    Quantity = p.Quantity,
                    UnitPrice = product.Price
                });
            }

            await _context.SaveChangesAsync();
            return order.OrderId;
        }

        public async Task<bool> UpdateStatusAsync(int orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return false;

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CancelOrderAsync(int userId, int orderId)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o =>
                o.OrderId == orderId && o.UserId == userId);

            if (order == null || order.Status != "Processing")
                return false;

            order.Status = "Cancelled";
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
