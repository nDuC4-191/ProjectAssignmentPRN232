using PlantCare.Application.DTOs.UserDADTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PlantCare.Application.DTOs;

namespace PlantCare.Application.Interfaces
{
    public interface IUserDAService
    {
        Task<List<UserDADto>> GetAllAsync();
        Task<UserDADto> GetByIdAsync(int id);
        Task<bool> UpdateRoleAsync(int userId, string role);
        Task<bool> SetActiveAsync(int userId, bool isActive);
    }
}
