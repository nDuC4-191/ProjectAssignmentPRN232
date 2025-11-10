using System;
using System.Collections.Generic;

namespace PlantCare.Infrastructure.Models;

public partial class Product
{
    public int ProductId { get; set; }

    public int CategoryId { get; set; }

    public string ProductName { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int? Stock { get; set; }

    public string? Difficulty { get; set; }

    public string? LightRequirement { get; set; }

    public string? WaterRequirement { get; set; }

    public string? SoilType { get; set; }

    public string? ImageUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<CareSuggestion> CareSuggestions { get; set; } = new List<CareSuggestion>();

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<PlantCareTip> PlantCareTips { get; set; } = new List<PlantCareTip>();

    public virtual ICollection<UserPlant> UserPlants { get; set; } = new List<UserPlant>();
}
