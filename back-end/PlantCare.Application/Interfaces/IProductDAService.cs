using PlantCare.Application.DTOs.ProductDADTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces;

/// <summary>
/// Interface cho Product Data Access Service (Admin)
/// </summary>
public interface IProductDAService
{
    /// <summary>
    /// Lấy tất cả sản phẩm (không phân trang)
    /// </summary>
    /// <returns>Danh sách tất cả sản phẩm</returns>
    Task<List<ProductDADto>> GetAllAsync();

    /// <summary>
    /// Lấy sản phẩm theo ID
    /// </summary>
    /// <param name="id">ID sản phẩm</param>
    /// <returns>Sản phẩm hoặc null nếu không tồn tại</returns>
    Task<ProductDADto?> GetByIdAsync(int id);

    /// <summary>
    /// Tạo sản phẩm mới – ProductId tự tăng bởi DB
    /// </summary>
    /// <param name="dto">Thông tin sản phẩm</param>
    /// <returns>ID của sản phẩm vừa tạo</returns>
    Task<int> CreateAsync(CreateUpdateProductDADto dto);

    /// <summary>
    /// Cập nhật sản phẩm
    /// </summary>
    /// <param name="id">ID sản phẩm</param>
    /// <param name="dto">Thông tin cập nhật</param>
    /// <returns>true nếu thành công, false nếu không tìm thấy</returns>
    Task<bool> UpdateAsync(int id, CreateUpdateProductDADto dto);

    /// <summary>
    /// Xóa sản phẩm
    /// </summary>
    /// <param name="id">ID sản phẩm</param>
    /// <returns>true nếu xóa thành công</returns>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Lấy danh sách sản phẩm có LỌC (không phân trang)
    /// </summary>
    /// <param name="query">Tham số lọc: Search, CategoryId, Price, v.v.</param>
    /// <returns>Danh sách sản phẩm đã lọc</returns>
    Task<List<ProductDADto>> GetProductsAsync(ProductQueryParameters? query = null);
}