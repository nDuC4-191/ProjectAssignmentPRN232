using System;
using System.Collections.Generic;

namespace PlantCare.Infrastructure.Models;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public int UserId { get; set; }

    public int? OrderId { get; set; }

    public int? ProductId { get; set; }

    public string? Message { get; set; }

    public string? ImageUrl { get; set; }

    public string? Status { get; set; }

    public string? AdminResponse { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Product? Product { get; set; }

    public virtual User User { get; set; } = null!;
}
