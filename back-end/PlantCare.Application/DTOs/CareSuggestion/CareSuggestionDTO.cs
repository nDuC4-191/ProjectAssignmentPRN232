// Path: PlantCare.Application/DTOs/CareSuggestion/CareSuggestionDTO.cs
namespace PlantCare.Application.DTOs.CareSuggestion
{
    public class CareSuggestionDTO
    {
        public int SuggestionID { get; set; }
        public string? Condition { get; set; }
        public string? Reason { get; set; }
        public ProductSuggestionDTO SuggestedProduct { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ProductSuggestionDTO
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public string? Difficulty { get; set; }
        public string? LightRequirement { get; set; }
        public string? WaterRequirement { get; set; }
    }

    public class UserConditionDTO
    {
        public string? LightAvailability { get; set; } // Thấp, Vừa, Cao
        public string? TimeAvailable { get; set; } // Bận rộn, Vừa, Nhiều thời gian
        public string? Experience { get; set; } // Mới, Trung bình, Có kinh nghiệm
        public List<string>? PreferredTypes { get; set; } // Cây cảnh, Cây trong nhà, v.v.
    }

    public class PlantCareGuideDTO
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; }
        public string? GeneralCare { get; set; }
        public WateringGuideDTO WateringGuide { get; set; }
        public FertilizingGuideDTO FertilizingGuide { get; set; }
        public LightGuideDTO LightGuide { get; set; }
        public SoilGuideDTO SoilGuide { get; set; }
        public List<string> CommonIssues { get; set; }
        public List<string> Tips { get; set; }
    }

    public class WateringGuideDTO
    {
        public string Frequency { get; set; }
        public string Amount { get; set; }
        public string Signs { get; set; }
    }

    public class FertilizingGuideDTO
    {
        public string Frequency { get; set; }
        public string Type { get; set; }
        public string Season { get; set; }
    }

    public class LightGuideDTO
    {
        public string Requirement { get; set; }
        public string Duration { get; set; }
        public string Placement { get; set; }
    }

    public class SoilGuideDTO
    {
        public string Type { get; set; }
        public string pH { get; set; }
        public string Drainage { get; set; }
    }
}