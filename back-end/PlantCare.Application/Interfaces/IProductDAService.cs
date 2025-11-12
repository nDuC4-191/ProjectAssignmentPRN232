using PlantCare.Application.DTOs.Common;
using PlantCare.Application.DTOs.ProductDADTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface IProductDAService
    {
        Task<List<ProductDADto>> GetAllAsync();
        Task<ProductDADto> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateUpdateProductDADto dto);
        Task<bool> UpdateAsync(int id, CreateUpdateProductDADto dto);
        Task<bool> DeleteAsync(int id);
        Task<PagedResult<ProductDADto>> GetProductsAsync(ProductQueryParameters query);
    }
}
