using System;
using System.Collections.Generic;

namespace PlantCare.Infrastructure.Models;

public partial class Reminder
{
    public int ReminderId { get; set; }

    public int UserPlantId { get; set; }

    public string ReminderType { get; set; } = null!;

    public string? Message { get; set; }

    public DateTime ReminderDate { get; set; }

    public bool? IsCompleted { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual UserPlant UserPlant { get; set; } = null!;
}
