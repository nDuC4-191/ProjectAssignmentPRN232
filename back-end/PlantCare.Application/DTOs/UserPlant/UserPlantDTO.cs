using System.ComponentModel.DataAnnotations;

namespace PlantCare.Application.DTOs.UserPlant
{
    // ============================================
    // READ DTOs (GET responses)
    // ============================================

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
        public List<ReminderDTO> UpcomingReminders { get; set; } = new(); // ⭐ Initialize
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

    // ============================================
    // WRITE DTOs (POST/PUT requests) - ⭐ WITH VALIDATION
    // ============================================

    public class CreateUserPlantDTO
    {
        [Required(ErrorMessage = "ProductID là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "ProductID phải lớn hơn 0")]
        public int ProductID { get; set; }

        [StringLength(100, ErrorMessage = "Tên gọi không được vượt quá 100 ký tự")]
        public string? Nickname { get; set; }

        public DateOnly? PlantedDate { get; set; }

        [StringLength(500, ErrorMessage = "Ghi chú không được vượt quá 500 ký tự")]
        public string? Notes { get; set; }
    }

    public class UpdateUserPlantDTO
    {
        [Required(ErrorMessage = "UserPlantID là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "UserPlantID phải lớn hơn 0")]
        public int UserPlantID { get; set; }

        [StringLength(100, ErrorMessage = "Tên gọi không được vượt quá 100 ký tự")]
        public string? Nickname { get; set; }

        // ⭐ Thêm PlantedDate (thiếu trong code cũ)
        public DateOnly? PlantedDate { get; set; }

        public DateOnly? LastWatered { get; set; }

        public DateOnly? LastFertilized { get; set; }

        [StringLength(500, ErrorMessage = "Ghi chú không được vượt quá 500 ký tự")]
        public string? Notes { get; set; }

        [RegularExpression("^(Đang sống|Chết|Đã tặng|Đã bán)$",
            ErrorMessage = "Trạng thái chỉ có thể là: Đang sống, Chết, Đã tặng, Đã bán")]
        public string? Status { get; set; }
    }

    public class UpdateCareDTO
    {
        [Required(ErrorMessage = "Ngày chăm sóc là bắt buộc")]
        public DateTime Date { get; set; }
    }

    public class UpdateStatusDTO
    {
        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        [RegularExpression("^(Đang sống|Chết|Đã tặng|Đã bán)$",
            ErrorMessage = "Trạng thái chỉ có thể là: Đang sống, Chết, Đã tặng, Đã bán")]
        public string Status { get; set; }
    }
}