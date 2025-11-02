// Path: PlantCare.Application/Services/UserPlantService.cs
using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.UserPlant;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;

namespace PlantCare.Application.Services
{
    public class UserPlantService : IUserPlantService
    {
        private readonly PlantCareContext _context;

        public UserPlantService(PlantCareContext context)
        {
            _context = context;
        }

        
        public async Task<List<UserPlantDTO>> GetUserPlantsAsync(int userId)
        {
            return await _context.UserPlants
                .Include(up => up.Product)
                .Where(up => up.UserId == userId)
                .Select(up => new UserPlantDTO
                {
                    UserPlantID = up.UserPlantId,
                    UserID = up.UserId,
                    ProductID = up.ProductId,
                    ProductName = up.Product.ProductName,
                    Nickname = up.Nickname,
                    PlantedDate = up.PlantedDate,
                    LastWatered = up.LastWatered,
                    LastFertilized = up.LastFertilized,
                    Notes = up.Notes,
                    Status = up.Status,
                    ImageUrl = up.Product.ImageUrl,
                    Difficulty = up.Product.Difficulty,
                    LightRequirement = up.Product.LightRequirement,
                    WaterRequirement = up.Product.WaterRequirement,
                    CreatedAt = up.CreatedAt ?? DateTime.UtcNow
                })
                .OrderByDescending(up => up.CreatedAt)
                .ToListAsync();
        }

        public async Task<UserPlantDetailDTO> GetUserPlantDetailAsync(int userPlantId, int userId)
        {
            var userPlant = await _context.UserPlants
                .Include(up => up.Product)
                .Include(up => up.Reminders)
                .FirstOrDefaultAsync(up => up.UserPlantId == userPlantId && up.UserId == userId);

            if (userPlant == null)
                return null;

            var today = DateOnly.FromDateTime(DateTime.Now);

            return new UserPlantDetailDTO
            {
                UserPlantID = userPlant.UserPlantId,
                Nickname = userPlant.Nickname,
                PlantedDate = userPlant.PlantedDate,
                LastWatered = userPlant.LastWatered,
                LastFertilized = userPlant.LastFertilized,
                Notes = userPlant.Notes,
                Status = userPlant.Status,
                DaysSincePlanted = userPlant.PlantedDate.HasValue
                    ? today.DayNumber - userPlant.PlantedDate.Value.DayNumber : 0,
                DaysSinceWatered = userPlant.LastWatered.HasValue
                    ? today.DayNumber - userPlant.LastWatered.Value.DayNumber : 0,
                DaysSinceFertilized = userPlant.LastFertilized.HasValue
                    ? today.DayNumber - userPlant.LastFertilized.Value.DayNumber : 0,
                Product = new ProductInfoDTO
                {
                    ProductID = userPlant.Product.ProductId,
                    ProductName = userPlant.Product.ProductName,
                    Description = userPlant.Product.Description,
                    ImageUrl = userPlant.Product.ImageUrl,
                    Difficulty = userPlant.Product.Difficulty,
                    LightRequirement = userPlant.Product.LightRequirement,
                    WaterRequirement = userPlant.Product.WaterRequirement,
                    SoilType = userPlant.Product.SoilType
                },
                UpcomingReminders = userPlant.Reminders
                    .Where(r => r.IsCompleted.HasValue && r.IsCompleted.Value == false && r.ReminderDate >= DateTime.UtcNow)
                    .Select(r => new ReminderDTO
                    {
                        ReminderID = r.ReminderId,
                        ReminderType = r.ReminderType,
                        Message = r.Message,
                        ReminderDate = r.ReminderDate,
                        IsCompleted = r.IsCompleted ?? false
                    })
                    .OrderBy(r => r.ReminderDate)
                    .ToList()
            };
        }

        public async Task<UserPlantDTO> AddUserPlantAsync(int userId, CreateUserPlantDTO dto)
        {
            var product = await _context.Products.FindAsync(dto.ProductID);
            if (product == null)
                throw new Exception("Sản phẩm không tồn tại");

            var userPlant = new UserPlant
            {
                UserId = userId,
                ProductId = dto.ProductID,
                Nickname = dto.Nickname,
                PlantedDate = dto.PlantedDate ?? DateOnly.FromDateTime(DateTime.Now),
                Notes = dto.Notes,
                Status = "Đang sống",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserPlants.Add(userPlant);
            await _context.SaveChangesAsync();

            // Tạo reminder mặc định
            await CreateDefaultRemindersAsync(userPlant.UserPlantId, product);
            await _context.SaveChangesAsync();

            return new UserPlantDTO
            {
                UserPlantID = userPlant.UserPlantId,
                UserID = userPlant.UserId,
                ProductID = userPlant.ProductId,
                ProductName = product.ProductName,
                Nickname = userPlant.Nickname,
                PlantedDate = userPlant.PlantedDate,
                Status = userPlant.Status,
                ImageUrl = product.ImageUrl,
                CreatedAt = userPlant.CreatedAt ?? DateTime.UtcNow
            };
        }

        public async Task<bool> UpdateUserPlantAsync(int userId, UpdateUserPlantDTO dto)
        {
            var userPlant = await _context.UserPlants
                .FirstOrDefaultAsync(up => up.UserPlantId == dto.UserPlantID && up.UserId == userId);

            if (userPlant == null)
                return false;

            if (!string.IsNullOrEmpty(dto.Nickname))
                userPlant.Nickname = dto.Nickname;

            if (dto.LastWatered.HasValue)
                userPlant.LastWatered = dto.LastWatered.Value;

            if (dto.LastFertilized.HasValue)
                userPlant.LastFertilized = dto.LastFertilized.Value;

            if (!string.IsNullOrEmpty(dto.Notes))
                userPlant.Notes = dto.Notes;

            if (!string.IsNullOrEmpty(dto.Status))
                userPlant.Status = dto.Status;

            userPlant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserPlantAsync(int userPlantId, int userId)
        {
            var userPlant = await _context.UserPlants
                .Include(up => up.Reminders)
                .FirstOrDefaultAsync(up => up.UserPlantId == userPlantId && up.UserId == userId);

            if (userPlant == null)
                return false;

            _context.Reminders.RemoveRange(userPlant.Reminders);
            _context.UserPlants.Remove(userPlant);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateWateringAsync(int userPlantId, int userId, DateTime wateredDate)
        {
            var userPlant = await _context.UserPlants
                .Include(up => up.Product)
                .FirstOrDefaultAsync(up => up.UserPlantId == userPlantId && up.UserId == userId);

            if (userPlant == null)
                return false;

            userPlant.LastWatered = DateOnly.FromDateTime(wateredDate);
            userPlant.UpdatedAt = DateTime.UtcNow;

            // Tạo reminder cho lần tưới tiếp theo
            var nextWateringDate = CalculateNextWateringDate(wateredDate, userPlant.Product.WaterRequirement);
            await CreateReminderAsync(userPlantId, "Tưới",
                $"Đến lúc tưới {userPlant.Nickname ?? userPlant.Product.ProductName}", nextWateringDate);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateFertilizingAsync(int userPlantId, int userId, DateTime fertilizedDate)
        {
            var userPlant = await _context.UserPlants
                .Include(up => up.Product)
                .FirstOrDefaultAsync(up => up.UserPlantId == userPlantId && up.UserId == userId);

            if (userPlant == null)
                return false;

            userPlant.LastFertilized = DateOnly.FromDateTime(fertilizedDate);
            userPlant.UpdatedAt = DateTime.UtcNow;

            // Tạo reminder cho lần bón phân tiếp theo (mặc định 30 ngày)
            var nextFertilizingDate = fertilizedDate.AddDays(30);
            await CreateReminderAsync(userPlantId, "Bón phân",
                $"Đến lúc bón phân cho {userPlant.Nickname ?? userPlant.Product.ProductName}", nextFertilizingDate);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdatePlantStatusAsync(int userPlantId, int userId, string status)
        {
            var userPlant = await _context.UserPlants
                .FirstOrDefaultAsync(up => up.UserPlantId == userPlantId && up.UserId == userId);

            if (userPlant == null)
                return false;

            userPlant.Status = status;
            userPlant.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<UserPlantDTO>> GetPlantsByStatusAsync(int userId, string status)
        {
            return await _context.UserPlants
                .Include(up => up.Product)
                .Where(up => up.UserId == userId && up.Status == status)
                .Select(up => new UserPlantDTO
                {
                    UserPlantID = up.UserPlantId,
                    ProductName = up.Product.ProductName,
                    Nickname = up.Nickname,
                    Status = up.Status,
                    ImageUrl = up.Product.ImageUrl,
                    PlantedDate = up.PlantedDate
                })
                .ToListAsync();
        }

        public async Task<List<UserPlantDTO>> SearchUserPlantsAsync(int userId, string searchTerm)
        {
            return await _context.UserPlants
                .Include(up => up.Product)
                .Where(up => up.UserId == userId &&
                    ((up.Nickname != null && up.Nickname.Contains(searchTerm)) ||
                     up.Product.ProductName.Contains(searchTerm)))
                .Select(up => new UserPlantDTO
                {
                    UserPlantID = up.UserPlantId,
                    ProductName = up.Product.ProductName,
                    Nickname = up.Nickname,
                    Status = up.Status,
                    ImageUrl = up.Product.ImageUrl
                })
                .ToListAsync();
        }

        public async Task<UserPlantStatisticsDTO> GetUserPlantStatisticsAsync(int userId)
        {
            var plants = await _context.UserPlants
                .Where(up => up.UserId == userId)
                .ToListAsync();

            var today = DateOnly.FromDateTime(DateTime.Now);

            return new UserPlantStatisticsDTO
            {
                TotalPlants = plants.Count,
                AlivePlants = plants.Count(p => p.Status == "Đang sống"),
                DeadPlants = plants.Count(p => p.Status == "Chết"),
                PlantsNeedWatering = plants.Count(p => !p.LastWatered.HasValue ||
                    (today.DayNumber - p.LastWatered.Value.DayNumber) >= 7),
                PlantsNeedFertilizing = plants.Count(p => !p.LastFertilized.HasValue ||
                    (today.DayNumber - p.LastFertilized.Value.DayNumber) >= 30)
            };
        }

        // Helper methods
        private async Task CreateDefaultRemindersAsync(int userPlantId, Product product)
        {
            var wateringDays = GetWateringInterval(product.WaterRequirement);
            var nextWatering = DateTime.UtcNow.AddDays(wateringDays);

            await CreateReminderAsync(userPlantId, "Tưới", $"Đến lúc tưới {product.ProductName}", nextWatering);
            await CreateReminderAsync(userPlantId, "Bón phân", $"Đến lúc bón phân cho {product.ProductName}",
                DateTime.UtcNow.AddDays(30));
        }

        private Task CreateReminderAsync(int userPlantId, string type, string message, DateTime reminderDate)
        {
            var reminder = new Reminder
            {
                UserPlantId = userPlantId,
                ReminderType = type,
                Message = message,
                ReminderDate = reminderDate,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Reminders.Add(reminder);
            return Task.CompletedTask;
        }

        private DateTime CalculateNextWateringDate(DateTime lastWatered, string waterRequirement)
        {
            return lastWatered.AddDays(GetWateringInterval(waterRequirement));
        }

        private int GetWateringInterval(string waterRequirement)
        {
            return waterRequirement switch
            {
                "Ít" => 10,
                "Vừa" => 5,
                "Nhiều" => 2,
                _ => 7
            };
        }

       
    }
}