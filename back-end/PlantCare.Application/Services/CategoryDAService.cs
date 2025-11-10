using PlantCare.Application.DTOs.Category;
using PlantCare.Application.Interfaces;
using PlantCare.Application.Interfaces.Repository;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class CategoryDAService : ICategoryDAService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryDAService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        private CategoryDADTO MapToDTO(Category entity)
        {
            return new CategoryDADTO
            {
                CategoryId = entity.CategoryId,
                CategoryName = entity.CategoryName,
                Description = entity.Description,
                ParentId = entity.ParentId,
                CreatedAt = entity.CreatedAt
            };
        }

        public async Task<List<CategoryDADTO>> GetAllCategoriesAsync()
        {
            var entities = await _categoryRepository.GetAllAsync();
            return entities.Select(MapToDTO).ToList();
        }

        public async Task<CategoryDADTO> CreateCategoryAsync(CreateCategoryDTO dto)
        {
            if (dto.ParentId.HasValue && await _categoryRepository.GetByIdAsync(dto.ParentId.Value) == null)
            {
                throw new KeyNotFoundException("Danh mục cha không tồn tại.");
            }

            var entity = new Category
            {
                CategoryName = dto.CategoryName,
                Description = dto.Description,
                ParentId = dto.ParentId
            };

            var addedEntity = await _categoryRepository.AddAsync(entity);
            return MapToDTO(addedEntity);
        }

        public async Task UpdateCategoryAsync(UpdateCategoryDADTO dto)
        {
            if (dto.ParentId.HasValue && await _categoryRepository.GetByIdAsync(dto.ParentId.Value) == null)
            {
                throw new KeyNotFoundException("Danh mục cha không tồn tại.");
            }
            if (dto.ParentId == dto.CategoryId)
            {
                throw new InvalidOperationException("Danh mục không thể là chính nó.");
            }

            // Lấy entity hiện có để cập nhật
            var existingEntity = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (existingEntity == null) throw new KeyNotFoundException("Danh mục không tồn tại.");

            existingEntity.CategoryName = dto.CategoryName;
            existingEntity.Description = dto.Description;
            existingEntity.ParentId = dto.ParentId;

            await _categoryRepository.UpdateAsync(existingEntity);
        }

        public Task DeleteCategoryAsync(int id)
        {
            // Cần thêm logic kiểm tra ràng buộc khóa ngoại trước khi gọi Repository
            return _categoryRepository.DeleteAsync(id);
        }

        public async Task<CategoryDADTO> GetCategoryByIdAsync(int id)
        {
            var entity = await _categoryRepository.GetByIdAsync(id);
            if (entity == null) throw new KeyNotFoundException("Danh mục không tồn tại.");
            return MapToDTO(entity);
        }
    }
}
