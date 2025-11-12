using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.Common;
using PlantCare.Application.DTOs.ProductDADTO;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PlantCare.Application.DTOs.ProductDADTO; 
using PlantCare.Application.DTOs.Common;  

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
                    Stock = p.Stock ?? 0, // Handle nullable int
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
                Stock = p.Stock ?? 0,
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

        public async Task<PagedResult<ProductDADto>> GetProductsAsync(ProductQueryParameters query)
        {
            // Bắt đầu query từ DbSet
            var queryable = _context.Products
                .Where(p => (p.Stock ?? 0) > 0); // Chỉ lấy sản phẩm còn hàng

            // fiter theo Search (Tên)
            if (!string.IsNullOrEmpty(query.Search))
            {
                queryable = queryable.Where(p => p.ProductName.Contains(query.Search));
            }

            // fiter theo Category
            if (query.CategoryId.HasValue)
            {
                queryable = queryable.Where(p => p.CategoryId == query.CategoryId.Value);
            }

            // fiter theo Giá
            if (query.MinPrice.HasValue)
            {
                queryable = queryable.Where(p => p.Price >= query.MinPrice.Value);
            }
            if (query.MaxPrice.HasValue)
            {
                queryable = queryable.Where(p => p.Price <= query.MaxPrice.Value);
            }

            // fiter theo Độ khó
            if (!string.IsNullOrEmpty(query.Difficulty))
            {
                queryable = queryable.Where(p => p.Difficulty == query.Difficulty);
            }

            // fiter theo Ánh sáng
            if (!string.IsNullOrEmpty(query.LightRequirement))
            {
                queryable = queryable.Where(p => p.LightRequirement == query.LightRequirement);
            }

            // fiter theo Nước
            if (!string.IsNullOrEmpty(query.WaterRequirement))
            {
                queryable = queryable.Where(p => p.WaterRequirement == query.WaterRequirement);
            }

            // Lấy tổng số lượng (trước khi phân trang)
            var totalCount = await queryable.CountAsync();

            // Phân trang
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(p => new ProductDADto // Map sang DTO
                {
                    ProductID = p.ProductId,
                    CategoryID = p.CategoryId,
                    ProductName = p.ProductName,
                    Description = p.Description,
                    Price = p.Price,
                    Stock = p.Stock ?? 0,
                    Difficulty = p.Difficulty,
                    LightRequirement = p.LightRequirement,
                    WaterRequirement = p.WaterRequirement,
                    SoilType = p.SoilType
                })
                .ToListAsync();

            return new PagedResult<ProductDADto>(items, totalCount, query.PageNumber, query.PageSize);
        }
    }
}
