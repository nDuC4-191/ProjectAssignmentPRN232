namespace PlantCare.Application.DTOs.PlantCare
{
    public class PlantCareTipDTO
    {
        public int TipId { get; set; }
        public int ProductId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Category { get; set; }
        public int SortOrder { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Thông tin Product
        public string ProductName { get; set; }
        public string ProductImage { get; set; }
        public string Difficulty { get; set; }
        public string LightRequirement { get; set; }
        public string WaterRequirement { get; set; }
        public decimal Price { get; set; }
    }

    public class PlantWikiListDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ShortDescription { get; set; }
        public string ImageUrl { get; set; }
        public int TipCount { get; set; }
        public string Difficulty { get; set; }
    }

    public class CreatePlantCareTipDTO
    {
        public int ProductId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Category { get; set; }
        public int SortOrder { get; set; }
    }

    public class UpdatePlantCareTipDTO
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public string Category { get; set; }
        public int SortOrder { get; set; }
    }
}