using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.Feedback;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly PlantCareContext _context;

        public FeedbackService(PlantCareContext context)
        {
            _context = context;
        }

        public async Task<List<FeedbackDTO>> GetFeedbackForProductAsync(int productId)
        {
            return await _context.Feedbacks
                .Include(f => f.User) // Join với User
                .Where(f => f.ProductId == productId && f.Status == "Approved") // Chỉ lấy fb đã duyệt (giả định thế đã)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    UserName = f.User.FullName, 
                    ProductId = f.ProductId ?? 0,
                    Message = f.Message,
                    ImageUrl = f.ImageUrl,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<FeedbackDTO> AddFeedbackAsync(int userId, CreateFeedbackDTO dto)
        {
            //User này có mua Product có cái Id này trong cái OrderId này không?
            var hasPurchased = await _context.OrderDetails
                .AnyAsync(od => od.Order.UserId == userId &&
                               od.OrderId == dto.OrderId &&
                               od.ProductId == dto.ProductId);

            if (!hasPurchased)
            {
                throw new InvalidOperationException("Bạn chỉ có thể đánh giá sản phẩm bạn đã mua.");
            }

            var feedback = new Feedback
            {
                UserId = userId,
                OrderId = dto.OrderId,
                ProductId = dto.ProductId,
                Message = dto.Message,
                ImageUrl = dto.ImageUrl,
                Status = "New",
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            // Tải thông tin User để trả về (vì feedback.User đang là null)
            await _context.Entry(feedback).Reference(f => f.User).LoadAsync();

            return new FeedbackDTO
            {
                FeedbackId = feedback.FeedbackId,
                UserId = feedback.UserId,
                UserName = feedback.User.FullName,
                ProductId = feedback.ProductId ?? 0,
                Message = feedback.Message,
                ImageUrl = feedback.ImageUrl,
                CreatedAt = feedback.CreatedAt
            };
        }
    }
}
