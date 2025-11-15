using System.ComponentModel.DataAnnotations;

namespace PlantCare.Application.DTOs.Authentication
{
    public class VerifyEmailDTO
    {
        [Required(ErrorMessage = "Token là bắt buộc")]
        public string Token { get; set; } = string.Empty;
    }
}