using Microsoft.EntityFrameworkCore;
using PlantCare.Application.Interfaces.Repository;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class CategoryDARepository : ICategoryRepository
    {
        private readonly PlantCareContext _context; // Đảm bảo bạn dùng tên DbContext chính xác

        public CategoryDARepository(PlantCareContext context)
        {
            _context = context;
        }

        // --- CÁC PHƯƠNG THỨC CRUD ---

        public async Task<Category> GetByIdAsync(int id)
        {
            return await _context.Categories.FindAsync(id);
        }

        public async Task<List<Category>> GetAllAsync()
        {
            return await _context.Categories.ToListAsync();
        }

        public async Task<Category> AddAsync(Category category)
        {
            category.CreatedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;
            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task UpdateAsync(Category category)
        {
            category.UpdatedAt = DateTime.UtcNow;
            _context.Categories.Update(category);
            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category != null)
            {
                // **Chú ý:** Xử lý Foreign Key Constraints trong Service/DB
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
            }
        }
    }
}
