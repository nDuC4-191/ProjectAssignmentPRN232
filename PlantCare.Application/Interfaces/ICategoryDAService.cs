using PlantCare.Application.DTOs.Category;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface ICategoryDAService
    {
        Task<List<CategoryDADTO>> GetAllCategoriesAsync();
        Task<CategoryDADTO> GetCategoryByIdAsync(int id);
        Task<CategoryDADTO> CreateCategoryAsync(CreateCategoryDTO dto);
        Task UpdateCategoryAsync(UpdateCategoryDADTO dto);
        Task DeleteCategoryAsync(int id);
    }
}
