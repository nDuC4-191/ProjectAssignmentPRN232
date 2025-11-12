using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.Order;
using PlantCare.Application.DTOs.OrderDTO;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly PlantCareContext _context;
        private readonly ICartService _cartService; // Tái sử dụng CartService
        private readonly IEmailService _emailService; // Dùng để gửi mail

        public OrderService(PlantCareContext context, ICartService cartService , IEmailService emailService )
        {
            _context = context;
            _cartService = cartService;
            _emailService = emailService;
        }

        public async Task<OrderDTO> CreateOrderAsync(int userId, CreateOrderDTO dto)
        {
            OrderDTO createdOrderDto = null; // Biến để lưu DTO
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // 1. Lấy giỏ hàng
                    var cart = await _cartService.GetCartByUserIdAsync(userId);
                    if (cart.Items == null || !cart.Items.Any())
                    {
                        throw new InvalidOperationException("Giỏ hàng trống.");
                    }

                    // 2. Làm phẳng địa chỉ từ DTO thành string
                    string shippingAddressString =
                        $"{dto.ShippingAddress.FullName}, {dto.ShippingAddress.PhoneNumber}, {dto.ShippingAddress.AddressLine}, {dto.ShippingAddress.City}, {dto.ShippingAddress.Country}";

                    // 3. Tạo Order
                    var order = new Order
                    {
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow,
                        Status = "Processing", // Trạng thái đầu
                        PaymentMethod = dto.PaymentMethod,
                        TotalAmount = cart.GrandTotal,
                        Address = shippingAddressString // LƯU Ý QUAN TRỌNG
                    };
                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync(); // Lưu để lấy OrderId

                    // 4. Chuyển CartItems thành OrderItems và giảm tồn kho
                    foreach (var item in cart.Items)
                    {
                        var product = await _context.Products.FindAsync(item.ProductId);
                        if (product == null || (product.Stock ?? 0) < item.Quantity)
                        {
                            throw new InvalidOperationException($"Sản phẩm {item.ProductName} không đủ hàng.");
                        }

                        // Giảm tồn kho
                        product.Stock = (product.Stock ?? 0) - item.Quantity;

                        // Tạo OrderDetail
                        var orderDetail = new OrderDetail
                        {
                            OrderId = order.OrderId,
                            ProductId = item.ProductId,
                            Quantity = item.Quantity,
                            UnitPrice = item.Price // Lưu giá tại thời điểm mua
                        };
                        _context.OrderDetails.Add(orderDetail);
                    }

                    // 5. Xóa Cart
                    await _cartService.ClearCartAsync(userId);

                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    // 6.Lấy DTO của đơn hàng vừa tạo (để gửi email)
                    createdOrderDto = await GetOrderDetailsAsync(userId, order.OrderId);
                    

                    return await GetOrderDetailsAsync(userId, order.OrderId);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            // 7. Gửi email xác nhận đơn hàng
            if (createdOrderDto != null)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null && user.Email != null)
                {
                    // Task: Xác nhận đơn hàng qua email
                    await _emailService.SendOrderConfirmationEmailAsync(user.Email, createdOrderDto);
                    // var user = await _context.Users.FindAsync(userId);
                    // await _emailService.SendOrderConfirmationEmail(user.Email, order.OrderId);
                }
            }

            // 9. Trả về DTO
            return createdOrderDto;
        }

        public async Task<List<OrderSummaryDTO>> GetOrderHistoryAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderSummaryDTO
                {
                    OrderId = o.OrderId,
                    OrderDate = o.CreatedAt ?? DateTime.MinValue,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount ?? 0
                })
                .ToListAsync();
        }

        public async Task<OrderDTO> GetOrderDetailsAsync(int userId, int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product) // Lấy cả thông tin Product
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

            if (order == null)
                throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

            // Ánh xạ ngược từ string Address sang DTO (chỉ có thể điền vào 1 trường)
            var shippingAddressDto = new ShippingAddressDTO
            {
                // Chỉ có thể trả về chuỗi đầy đủ
                AddressLine = order.Address
                // Các trường khác sẽ là null
            };

            return new OrderDTO
            {
                OrderId = order.OrderId,
                OrderDate = order.CreatedAt ?? DateTime.MinValue,
                Status = order.Status,
                TotalAmount = order.TotalAmount ?? 0,
                ShippingAddress = shippingAddressDto,
                OrderItems = order.OrderDetails.Select(od => new OrderItemDTO
                {
                    ProductId = od.ProductId,
                    ProductName = od.Product.ProductName,
                    Price = od.UnitPrice, // Lấy giá từ OrderDetail (chính xác)
                    Quantity = od.Quantity ?? 1
                }).ToList()
            };
        }

        public async Task<OrderStatusDTO> GetOrderStatusAsync(int userId, int orderId)
        {
            var order = await _context.Orders
                .Where(o => o.OrderId == orderId && o.UserId == userId)
                .Select(o => new OrderStatusDTO
                {
                    OrderId = o.OrderId,
                    CurrentStatus = o.Status,
                    LastUpdate = o.UpdatedAt ?? o.CreatedAt ?? DateTime.MinValue,
                    // EstimatedDeliveryDate = null // Model chưa có trường này-có thể thêm sau
                })
                .FirstOrDefaultAsync();

            if (order == null)
                throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

            return order;
        }
    }
}
