using System;
using System.Collections.Generic;

namespace PlantCare.Infrastructure.Models;

public partial class UserPlant
{
    public int UserPlantId { get; set; }

    public int UserId { get; set; }

    public int ProductId { get; set; }

    public string? Nickname { get; set; }

    public DateOnly? PlantedDate { get; set; }

    public DateOnly? LastWatered { get; set; }

    public DateOnly? LastFertilized { get; set; }

    public string? Notes { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();

    public virtual User User { get; set; } = null!;
}
