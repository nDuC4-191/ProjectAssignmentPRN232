
namespace PlantCare.Application.DTOs.UserPlant
{
    public class UserPlantDTO
    {
        public int UserPlantID { get; set; }
        public int UserID { get; set; }
        public int ProductID { get; set; }
        public string ProductName { get; set; }
        public string? Nickname { get; set; }
        public DateOnly? PlantedDate { get; set; }
        public DateOnly? LastWatered { get; set; }
        public DateOnly? LastFertilized { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
        public string? Difficulty { get; set; }
        public string? LightRequirement { get; set; }
        public string? WaterRequirement { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateUserPlantDTO
    {
        public int ProductID { get; set; }
        public string? Nickname { get; set; }
        public DateOnly? PlantedDate { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateUserPlantDTO
    {
        public int UserPlantID { get; set; }
        public string? Nickname { get; set; }
        public DateOnly? LastWatered { get; set; }
        public DateOnly? LastFertilized { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
    }

    public class UserPlantDetailDTO
    {
        public int UserPlantID { get; set; }
        public string? Nickname { get; set; }
        public DateOnly? PlantedDate { get; set; }
        public DateOnly? LastWatered { get; set; }
        public DateOnly? LastFertilized { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
        public int DaysSincePlanted { get; set; }
        public int DaysSinceWatered { get; set; }
        public int DaysSinceFertilized { get; set; }
        public ProductInfoDTO Product { get; set; }
        public List<ReminderDTO> UpcomingReminders { get; set; }
    }

    public class ProductInfoDTO
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? Difficulty { get; set; }
        public string? LightRequirement { get; set; }
        public string? WaterRequirement { get; set; }
        public string? SoilType { get; set; }
    }

    public class ReminderDTO
    {
        public int ReminderID { get; set; }
        public string ReminderType { get; set; }
        public string? Message { get; set; }
        public DateTime ReminderDate { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class UserPlantStatisticsDTO
    {
        public int TotalPlants { get; set; }
        public int AlivePlants { get; set; }
        public int DeadPlants { get; set; }
        public int PlantsNeedWatering { get; set; }
        public int PlantsNeedFertilizing { get; set; }
    }

    public class UpdateCareDTO
    {
        public DateTime Date { get; set; }
    }

    public class UpdateStatusDTO
    {
        public string Status { get; set; }
    }
}