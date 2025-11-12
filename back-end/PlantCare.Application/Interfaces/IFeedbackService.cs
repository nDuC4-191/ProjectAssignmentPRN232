using PlantCare.Application.DTOs.Feedback;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface IFeedbackService
    {
        Task<List<FeedbackDTO>> GetFeedbackForProductAsync(int productId);
        Task<FeedbackDTO> AddFeedbackAsync(int userId, CreateFeedbackDTO dto);
    }
}
