using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.Order;
using PlantCare.Application.DTOs.OrderDTO;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;


namespace PlantCare.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly PlantCareContext _context;
        private readonly ICartService _cartService;
        private readonly IEmailService _emailService;

        public OrderService(PlantCareContext context, ICartService cartService, IEmailService emailService)
        {
            _context = context;
            _cartService = cartService;
            _emailService = emailService;
        }

        // ==============================
        // 🧾 PHẦN 1: USER SIDE (Checkout / Lịch sử / Chi tiết)
        // ==============================

        // ✅ ĐỔI: CreateOrderDTO → CreateOrderRequestDTO
        public async Task<OrderDTO> CreateOrderAsync(int userId, CreateOrderRequestDTO dto)
        {
            OrderDTO createdOrderDto = null;

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // 1. Lấy giỏ hàng
                    var cart = await _cartService.GetCartByUserIdAsync(userId);
                    if (cart.Items == null || !cart.Items.Any())
                        throw new InvalidOperationException("Giỏ hàng trống.");

                    // 2. Làm phẳng địa chỉ từ DTO
                    string shippingAddressString =
                        $"{dto.ShippingAddress.FullName}, {dto.ShippingAddress.PhoneNumber}, {dto.ShippingAddress.AddressLine}, {dto.ShippingAddress.City}, {dto.ShippingAddress.Country}";

                    // 3. Tạo Order
                    var order = new Order
                    {
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow,
                        Status = "Processing",
                        //Status = "Pending",
                        PaymentMethod = dto.PaymentMethod,
                        TotalAmount = cart.GrandTotal,
                        Address = shippingAddressString
                    };

                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync();

                    // 4. Tạo OrderDetail và giảm tồn kho
                    foreach (var item in cart.Items)
                    {
                        var product = await _context.Products.FindAsync(item.ProductId);
                        if (product == null || (product.Stock ?? 0) < item.Quantity)
                            throw new InvalidOperationException($"Sản phẩm {item.ProductName} không đủ hàng.");

                        product.Stock = (product.Stock ?? 0) - item.Quantity;

                        var orderDetail = new OrderDetail
                        {
                            OrderId = order.OrderId,
                            ProductId = item.ProductId,
                            Quantity = item.Quantity,
                            UnitPrice = item.Price
                        };
                        _context.OrderDetails.Add(orderDetail);
                    }

                    // 5. Xóa giỏ hàng
                    await _cartService.ClearCartAsync(userId);

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // 6. Lấy DTO của đơn hàng để gửi email
                    createdOrderDto = await GetOrderDetailsAsync(userId, order.OrderId);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            // 7. Gửi email xác nhận
            if (createdOrderDto != null)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user?.Email != null)
                    await _emailService.SendOrderConfirmationEmailAsync(user.Email, createdOrderDto);
            }

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
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

            if (order == null)
                throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

            var shippingAddressDto = new ShippingAddressDTO
            {
                AddressLine = order.Address
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
                    Price = od.UnitPrice,
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
                    LastUpdate = o.UpdatedAt ?? o.CreatedAt ?? DateTime.MinValue
                })
                .FirstOrDefaultAsync();

            if (order == null)
                throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

            return order;
        }

        // ==============================
        // 📊 PHẦN 2: ADMIN SIDE (Quản lý, cập nhật, thống kê)
        // ==============================

        public async Task<IEnumerable<OrderListDto>> GetAllAsync(string? status = null, string? searchTerm = null)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(o => o.Status == status);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(o =>
                    o.OrderId.ToString().Contains(searchTerm) ||
                    o.User.FullName.Contains(searchTerm) ||
                    o.User.Email.Contains(searchTerm));
            }

            return await query
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
                UserName = order.User?.FullName ?? "N/A",
                UserEmail = order.User?.Email,
                UserPhone = order.User?.Phone,
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

        public async Task ConfirmOrderPaymentAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order != null && order.Status == "Processing") // Chỉ cập nhật nếu đang "Processing"
            {
                order.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task CancelOrderAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);

            // Chỉ hủy nếu đơn hàng đang "Processing"
            if (order != null && (order.Status == "Processing"))
            {
                order.Status = "Cancelled"; // Đánh dấu là đã hủy
                order.UpdatedAt = DateTime.UtcNow;

                // Hoàn trả lại số lượng 
                // 1. Tìm tất cả chi tiết đơn hàng
                var orderDetails = await _context.OrderDetails
                    .Where(od => od.OrderId == orderId)
                    .ToListAsync();

                foreach (var detail in orderDetails)
                {
                    // 2. Tìm sản phẩm tương ứng
                    var product = await _context.Products.FindAsync(detail.ProductId);
                    if (product != null)
                    {
                        // 3. Cộng (hoàn) trả tồn kho
                        // (Dùng ?? 0 để tránh lỗi nếu Stock là null)
                        product.Stock = (product.Stock ?? 0) + (detail.Quantity ?? 0);
                    }
                }

                await _context.SaveChangesAsync();
            }
        }
    }
}