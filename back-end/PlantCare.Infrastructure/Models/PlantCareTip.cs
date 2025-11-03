using System;
using System.Collections.Generic;

namespace PlantCare.Infrastructure.Models;

public partial class PlantCareTip
{
    public int TipId { get; set; }

    public int ProductId { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public string? Category { get; set; }

    public int? SortOrder { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Product Product { get; set; } = null!;
}
