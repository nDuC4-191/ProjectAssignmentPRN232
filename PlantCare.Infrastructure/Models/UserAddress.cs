using System;
using System.Collections.Generic;

namespace PlantCare.Infrastructure.Models;

public partial class UserAddress
{
    public int AddressId { get; set; }

    public int UserId { get; set; }

    public string? RecipientName { get; set; }

    public string? Phone { get; set; }

    public string? AddressLine { get; set; }

    public bool? IsDefault { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
