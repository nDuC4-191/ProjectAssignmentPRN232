using Microsoft.EntityFrameworkCore;

using PlantCare.Application.DTOs.OrderDTO;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;

namespace PlantCare.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly PlantCareContext _context;

        public OrderService(PlantCareContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<OrderListDto>> GetAllAsync(string? status = null, string? searchTerm = null)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .AsQueryable();

            // Filter by status
            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(o => o.Status == status);
            }

            // Search by OrderId or User Name/Email
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(o =>
                    o.OrderId.ToString().Contains(searchTerm) ||
                    o.User.FullName.Contains(searchTerm) ||
                    o.User.Email.Contains(searchTerm)
                );
            }

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderListDto
                {
                    OrderId = o.OrderId,
                    UserId = o.UserId,
                    UserName = o.User.FullName ?? "N/A",
                    UserEmail = o.User.Email,
                    Address = o.Address,
                    PaymentMethod = o.PaymentMethod,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    TotalItems = o.OrderDetails.Sum(od => od.Quantity ?? 0),
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt
                })
                .ToListAsync();

            return orders;
        }

        public async Task<OrderDetailDto?> GetByIdAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                return null;

            return new OrderDetailDto
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                UserName = order.User.FullName ?? "N/A",
                UserEmail = order.User.Email,
                UserPhone = order.User.Phone,
                Address = order.Address,
                PaymentMethod = order.PaymentMethod,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                OrderItems = order.OrderDetails.Select(od => new OrderItemDto
                {
                    OrderDetailId = od.OrderDetailId,
                    ProductId = od.ProductId,
                    ProductName = od.Product.ProductName,
                    ProductImage = od.Product.ImageUrl,
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    Subtotal = od.UnitPrice * (od.Quantity ?? 0)
                }).ToList()
            };
        }

        public async Task<bool> UpdateStatusAsync(int orderId, UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(orderId);

            if (order == null)
                return false;

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<OrderStatisticsDto> GetStatisticsAsync()
        {
            var orders = await _context.Orders.ToListAsync();

            return new OrderStatisticsDto
            {
                TotalOrders = orders.Count,
                TotalRevenue = orders.Sum(o => o.TotalAmount ?? 0),
                PendingOrders = orders.Count(o => o.Status == "Pending"),
                ProcessingOrders = orders.Count(o => o.Status == "Processing"),
                ShippingOrders = orders.Count(o => o.Status == "Shipping"),
                DeliveredOrders = orders.Count(o => o.Status == "Delivered"),
                CompletedOrders = orders.Count(o => o.Status == "Completed"),
                CancelledOrders = orders.Count(o => o.Status == "Cancelled")
            };
        }
    }
}