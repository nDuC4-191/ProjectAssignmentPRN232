// Path: PlantCare.Application/Interfaces/ICareSuggestionService.cs
using PlantCare.Application.DTOs.CareSuggestion;

namespace PlantCare.Application.Interfaces
{
    public interface ICareSuggestionService
    {
        // Hướng dẫn chăm sóc (Wiki cây)
        Task<PlantCareGuideDTO> GetPlantCareGuideAsync(int productId);
        Task<List<PlantCareGuideDTO>> GetAllCareGuidesAsync();
        Task<List<PlantCareGuideDTO>> SearchCareGuidesAsync(string searchTerm);

        // Gợi ý cây phù hợp
        Task<List<CareSuggestionDTO>> GetSuggestionsForUserAsync(int userId, UserConditionDTO condition);
        Task<List<ProductSuggestionDTO>> GetRecommendedPlantsAsync(UserConditionDTO condition);
        Task<bool> SaveUserSuggestionAsync(int userId, int productId, string condition, string reason);

        // Lịch sử gợi ý
        Task<List<CareSuggestionDTO>> GetUserSuggestionHistoryAsync(int userId);
    }
}