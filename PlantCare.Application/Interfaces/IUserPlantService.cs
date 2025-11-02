// Path: PlantCare.Application/Interfaces/IUserPlantService.cs
using PlantCare.Application.DTOs.UserPlant;
using PlantCare.Infrastructure.Models;

namespace PlantCare.Application.Interfaces
{
    public interface IUserPlantService
    {
        // Quản lý danh sách cây
        Task<List<UserPlantDTO>> GetUserPlantsAsync(int userId);
        Task<UserPlantDetailDTO> GetUserPlantDetailAsync(int userPlantId, int userId);
        Task<UserPlantDTO> AddUserPlantAsync(int userId, CreateUserPlantDTO dto);
        Task<bool> UpdateUserPlantAsync(int userId, UpdateUserPlantDTO dto);
        Task<bool> DeleteUserPlantAsync(int userPlantId, int userId);

        // Cập nhật trạng thái chăm sóc
        Task<bool> UpdateWateringAsync(int userPlantId, int userId, DateTime wateredDate);
        Task<bool> UpdateFertilizingAsync(int userPlantId, int userId, DateTime fertilizedDate);
        Task<bool> UpdatePlantStatusAsync(int userPlantId, int userId, string status);

        // Lọc và tìm kiếm
        Task<List<UserPlantDTO>> GetPlantsByStatusAsync(int userId, string status);
        Task<List<UserPlantDTO>> SearchUserPlantsAsync(int userId, string searchTerm);

        // Thống kê
        Task<UserPlantStatisticsDTO> GetUserPlantStatisticsAsync(int userId);

       

    }
}