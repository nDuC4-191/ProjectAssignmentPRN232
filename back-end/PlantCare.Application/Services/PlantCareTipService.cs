using PlantCare.Application.DTOs.PlantCare;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace PlantCare.Application.Services
{
    public class PlantCareTipService : IPlantCareTipService
    {
        private readonly PlantCareContext _context;

        public PlantCareTipService(PlantCareContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PlantWikiListDTO>> GetAllPlantsWithTipsAsync()
        {
            var plants = await _context.Products
                .Where(p => _context.PlantCareTips.Any(t => t.ProductId == p.ProductId))
                .Select(p => new PlantWikiListDTO
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    ShortDescription = p.Description != null && p.Description.Length > 100
                        ? p.Description.Substring(0, 100) + "..."
                        : p.Description ?? "",
                    ImageUrl = p.ImageUrl ?? "",
                    Difficulty = p.Difficulty ?? "",
                    TipCount = _context.PlantCareTips.Count(t => t.ProductId == p.ProductId)
                })
                .OrderBy(p => p.ProductName)
                .ToListAsync();

            return plants;
        }

        public async Task<IEnumerable<PlantCareTipDTO>> GetTipsByProductIdAsync(int productId)
        {
            var tips = await _context.PlantCareTips
                .Include(t => t.Product)
                .Where(t => t.ProductId == productId)
                .Select(t => new PlantCareTipDTO
                {
                    TipId = t.TipId,
                    ProductId = t.ProductId,
                    Title = t.Title,
                    Content = t.Content,
                    Category = t.Category ?? "",
                    SortOrder = t.SortOrder ?? 0,
                    CreatedAt = t.CreatedAt,
                    ProductName = t.Product.ProductName,
                    ProductImage = t.Product.ImageUrl ?? "",
                    Difficulty = t.Product.Difficulty ?? "",
                    LightRequirement = t.Product.LightRequirement ?? "",
                    WaterRequirement = t.Product.WaterRequirement ?? "",
                    Price = t.Product.Price
                })
                .OrderBy(t => t.SortOrder)
                .ThenBy(t => t.TipId)
                .ToListAsync();

            return tips;
        }

        public async Task<PlantCareTipDTO> GetByIdAsync(int tipId)
        {
            var tip = await _context.PlantCareTips
                .Include(t => t.Product)
                .Where(t => t.TipId == tipId)
                .Select(t => new PlantCareTipDTO
                {
                    TipId = t.TipId,
                    ProductId = t.ProductId,
                    Title = t.Title,
                    Content = t.Content,
                    Category = t.Category ?? "",
                    SortOrder = t.SortOrder ?? 0,
                    CreatedAt = t.CreatedAt,
                    ProductName = t.Product.ProductName,
                    ProductImage = t.Product.ImageUrl ?? "",
                    Difficulty = t.Product.Difficulty ?? "",
                    LightRequirement = t.Product.LightRequirement ?? "",
                    WaterRequirement = t.Product.WaterRequirement ?? "",
                    Price = t.Product.Price
                })
                .FirstOrDefaultAsync();

            return tip;
        }

        public async Task<IEnumerable<PlantCareTipDTO>> SearchTipsAsync(string keyword)
        {
            var tips = await _context.PlantCareTips
                .Include(t => t.Product)
                .Where(t => t.Title.Contains(keyword)
                         || t.Content.Contains(keyword)
                         || t.Product.ProductName.Contains(keyword))
                .Select(t => new PlantCareTipDTO
                {
                    TipId = t.TipId,
                    ProductId = t.ProductId,
                    Title = t.Title,
                    Content = t.Content,
                    Category = t.Category ?? "",
                    SortOrder = t.SortOrder ?? 0,
                    CreatedAt = t.CreatedAt,
                    ProductName = t.Product.ProductName,
                    ProductImage = t.Product.ImageUrl ?? ""
                })
                .ToListAsync();

            return tips;
        }

        public async Task<PlantCareTipDTO> CreateAsync(CreatePlantCareTipDTO dto)
        {
            var tip = new PlantCareTip
            {
                ProductId = dto.ProductId,
                Title = dto.Title,
                Content = dto.Content,
                Category = dto.Category,
                SortOrder = dto.SortOrder,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PlantCareTips.Add(tip);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(tip.TipId);
        }

        public async Task<bool> UpdateAsync(int tipId, UpdatePlantCareTipDTO dto)
        {
            var tip = await _context.PlantCareTips.FindAsync(tipId);
            if (tip == null) return false;

            tip.Title = dto.Title ?? tip.Title;
            tip.Content = dto.Content ?? tip.Content;
            tip.Category = dto.Category ?? tip.Category;
            tip.SortOrder = dto.SortOrder;
            tip.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int tipId)
        {
            var tip = await _context.PlantCareTips.FindAsync(tipId);
            if (tip == null) return false;

            _context.PlantCareTips.Remove(tip);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}