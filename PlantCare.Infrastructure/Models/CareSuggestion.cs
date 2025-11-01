using System;
using System.Collections.Generic;

namespace PlantCare.Infrastructure.Models;

public partial class CareSuggestion
{
    public int SuggestionId { get; set; }

    public int UserId { get; set; }

    public string? Condition { get; set; }

    public int SuggestedProductId { get; set; }

    public string? Reason { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Product SuggestedProduct { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
