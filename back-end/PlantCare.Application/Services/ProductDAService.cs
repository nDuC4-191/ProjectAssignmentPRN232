using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.ProductDADTO;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PlantCare.Application.Services;

/// <summary>
/// Product Data Access Service – DB-First, chỉ dùng link ảnh
/// </summary>
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
            .Include(p => p.Category) // ← BẮT BUỘC để lấy CategoryName
            .Select(p => new ProductDADto
            {
                ProductId = p.ProductId,
                CategoryID = p.CategoryId,
                CategoryName = p.Category.CategoryName, // ← ĐÚNG: CategoryName
                ProductName = p.ProductName,
                Description = p.Description ?? string.Empty,
                Price = p.Price,
                Stock = p.Stock,
                Difficulty = p.Difficulty,
                LightRequirement = p.LightRequirement,
                WaterRequirement = p.WaterRequirement,
                SoilType = p.SoilType, // ← ĐÚNG
                ImageUrl = p.ImageUrl
            })
            .ToListAsync();
    }

    public async Task<ProductDADto?> GetByIdAsync(int id)
    {
        var p = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (p == null) return null;

        return new ProductDADto
        {
            ProductId = p.ProductId,
            CategoryID = p.CategoryId,
            CategoryName = p.Category.CategoryName,
            ProductName = p.ProductName,
            Description = p.Description ?? string.Empty,
            Price = p.Price,
            Stock = p.Stock,
            Difficulty = p.Difficulty,
            LightRequirement = p.LightRequirement,
            WaterRequirement = p.WaterRequirement,
            SoilType = p.SoilType,
            ImageUrl = p.ImageUrl
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
            ImageUrl = dto.ImageUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
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
        product.ImageUrl = dto.ImageUrl;
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

    public async Task<List<ProductDADto>> GetProductsAsync(ProductQueryParameters? query = null)
    {
        query ??= new ProductQueryParameters();
        var queryable = _context.Products.Include(p => p.Category).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
            queryable = queryable.Where(p => p.ProductName.Contains(query.Search.Trim()));

        if (query.CategoryId.HasValue)
            queryable = queryable.Where(p => p.CategoryId == query.CategoryId.Value);

        if (query.MinPrice.HasValue)
            queryable = queryable.Where(p => p.Price >= query.MinPrice.Value);

        if (query.MaxPrice.HasValue)
            queryable = queryable.Where(p => p.Price <= query.MaxPrice.Value);

        if (!string.IsNullOrWhiteSpace(query.Difficulty))
            queryable = queryable.Where(p => p.Difficulty == query.Difficulty.Trim());

        if (!string.IsNullOrWhiteSpace(query.LightRequirement))
            queryable = queryable.Where(p => p.LightRequirement == query.LightRequirement.Trim());

        if (!string.IsNullOrWhiteSpace(query.WaterRequirement))
            queryable = queryable.Where(p => p.WaterRequirement == query.WaterRequirement.Trim());

        return await queryable
            .Select(p => new ProductDADto
            {
                ProductId = p.ProductId,
                CategoryID = p.CategoryId,
                CategoryName = p.Category.CategoryName,
                ProductName = p.ProductName,
                Description = p.Description ?? string.Empty,
                Price = p.Price,
                Stock = p.Stock,
                Difficulty = p.Difficulty,
                LightRequirement = p.LightRequirement,
                WaterRequirement = p.WaterRequirement,
                SoilType = p.SoilType,
                ImageUrl = p.ImageUrl
            })
            .ToListAsync();
    }
}