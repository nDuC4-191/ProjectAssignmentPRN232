using PlantCare.Application.DTOs.PlantCare;

namespace PlantCare.Application.Interfaces
{
    public interface IPlantCareTipService
    {
        Task<IEnumerable<PlantWikiListDTO>> GetAllPlantsWithTipsAsync();
        Task<IEnumerable<PlantCareTipDTO>> GetTipsByProductIdAsync(int productId);
        Task<PlantCareTipDTO> GetByIdAsync(int tipId);
        Task<IEnumerable<PlantCareTipDTO>> SearchTipsAsync(string keyword);
        Task<PlantCareTipDTO> CreateAsync(CreatePlantCareTipDTO dto);
        Task<bool> UpdateAsync(int tipId, UpdatePlantCareTipDTO dto);
        Task<bool> DeleteAsync(int tipId);
    }
}