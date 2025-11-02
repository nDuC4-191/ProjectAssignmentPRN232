using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.ProductDADTO;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class ProductDAService : IProductDAService
    {
        private readonly PlantCareContext _context;

        public ProductDAService(PlantCareContext context)
        {
            _context = context;
        }

        public async Task<List<ProductDADto>> GetAllAsync()
        {
            return await _context.Products
                .Select(p => new ProductDADto
                {
                    ProductID = p.ProductId,
                    CategoryID = p.CategoryId,
                    ProductName = p.ProductName,
                    Description = p.Description,
                    Price = p.Price,
                    Stock = p.Stock,
                    Difficulty = p.Difficulty,
                    LightRequirement = p.LightRequirement,
                    WaterRequirement = p.WaterRequirement,
                    SoilType = p.SoilType
                })
                .ToListAsync();
        }

        public async Task<ProductDADto> GetByIdAsync(int id)
        {
            var p = await _context.Products.FindAsync(id);
            if (p == null) return null;

            return new ProductDADto
            {
                ProductID = p.ProductId,
                CategoryID = p.CategoryId,
                ProductName = p.ProductName,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                Difficulty = p.Difficulty,
                LightRequirement = p.LightRequirement,
                WaterRequirement = p.WaterRequirement,
                SoilType = p.SoilType
            };
        }

        public async Task<int> CreateAsync(CreateUpdateProductDADto dto)
        {
            var product = new Product
            {
                CategoryId = dto.CategoryID,
                ProductName = dto.ProductName,
                Description = dto.Description,
                Price = dto.Price,
                Stock = dto.Stock,
                Difficulty = dto.Difficulty,
                LightRequirement = dto.LightRequirement,
                WaterRequirement = dto.WaterRequirement,
                SoilType = dto.SoilType,
                CreatedAt = DateTime.UtcNow
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product.ProductId;
        }

        public async Task<bool> UpdateAsync(int id, CreateUpdateProductDADto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            product.CategoryId = dto.CategoryID;
            product.ProductName = dto.ProductName;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.Difficulty = dto.Difficulty;
            product.LightRequirement = dto.LightRequirement;
            product.WaterRequirement = dto.WaterRequirement;
            product.SoilType = dto.SoilType;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
