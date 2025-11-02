// Path: PlantCare.Application/Services/CareSuggestionService.cs
using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.CareSuggestion;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;

namespace PlantCare.Application.Services
{
    public class CareSuggestionService : ICareSuggestionService
    {
        private readonly PlantCareContext _context;

        public CareSuggestionService(PlantCareContext context)
        {
            _context = context;
        }

        public async Task<PlantCareGuideDTO> GetPlantCareGuideAsync(int productId)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null)
                return null;

            return new PlantCareGuideDTO
            {
                ProductID = product.ProductId,
                ProductName = product.ProductName,
                GeneralCare = product.Description,
                WateringGuide = GetWateringGuide(product.WaterRequirement),
                FertilizingGuide = GetFertilizingGuide(),
                LightGuide = GetLightGuide(product.LightRequirement),
                SoilGuide = GetSoilGuide(product.SoilType),
                CommonIssues = GetCommonIssues(product.Difficulty),
                Tips = GetCareTips(product.Difficulty, product.WaterRequirement, product.LightRequirement)
            };
        }

        public async Task<List<PlantCareGuideDTO>> GetAllCareGuidesAsync()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .ToListAsync();

            return products.Select(p => new PlantCareGuideDTO
            {
                ProductID = p.ProductId,
                ProductName = p.ProductName,
                GeneralCare = p.Description,
                WateringGuide = GetWateringGuide(p.WaterRequirement),
                LightGuide = GetLightGuide(p.LightRequirement),
                SoilGuide = GetSoilGuide(p.SoilType)
            }).ToList();
        }

        public async Task<List<PlantCareGuideDTO>> SearchCareGuidesAsync(string searchTerm)
        {
            var products = await _context.Products
                .Where(p => p.ProductName.Contains(searchTerm) ||
                           (p.Description != null && p.Description.Contains(searchTerm)))
                .ToListAsync();

            return products.Select(p => new PlantCareGuideDTO
            {
                ProductID = p.ProductId,
                ProductName = p.ProductName,
                GeneralCare = p.Description,
                WateringGuide = GetWateringGuide(p.WaterRequirement),
                LightGuide = GetLightGuide(p.LightRequirement)
            }).ToList();
        }

        public async Task<List<CareSuggestionDTO>> GetSuggestionsForUserAsync(int userId, UserConditionDTO condition)
        {
            var recommendedProducts = await GetRecommendedPlantsAsync(condition);
            var suggestions = new List<CareSuggestionDTO>();

            foreach (var product in recommendedProducts)
            {
                var reason = BuildReasonText(condition, product);

                suggestions.Add(new CareSuggestionDTO
                {
                    Condition = $"Ánh sáng: {condition.LightAvailability}, Thời gian: {condition.TimeAvailable}",
                    Reason = reason,
                    SuggestedProduct = product,
                    CreatedAt = DateTime.UtcNow
                });

                // Lưu vào database
                await SaveUserSuggestionAsync(userId, product.ProductID,
                    $"Light:{condition.LightAvailability},Time:{condition.TimeAvailable}", reason);
            }

            await _context.SaveChangesAsync();
            return suggestions;
        }

        public async Task<List<ProductSuggestionDTO>> GetRecommendedPlantsAsync(UserConditionDTO condition)
        {
            var query = _context.Products.AsQueryable();

            // Lọc theo ánh sáng
            if (!string.IsNullOrEmpty(condition.LightAvailability))
            {
                query = query.Where(p => p.LightRequirement == condition.LightAvailability);
            }

            // Lọc theo kinh nghiệm (độ khó)
            if (!string.IsNullOrEmpty(condition.Experience))
            {
                var difficulty = condition.Experience switch
                {
                    "Mới" => "Dễ",
                    "Trung bình" => "Trung bình",
                    "Có kinh nghiệm" => "Khó",
                    _ => "Dễ"
                };
                query = query.Where(p => p.Difficulty == difficulty);
            }

            // Lọc theo thời gian (tưới nước)
            if (!string.IsNullOrEmpty(condition.TimeAvailable))
            {
                var waterReq = condition.TimeAvailable switch
                {
                    "Bận rộn" => "Ít",
                    "Vừa" => "Vừa",
                    "Nhiều thời gian" => "Nhiều",
                    _ => "Vừa"
                };
                query = query.Where(p => p.WaterRequirement == waterReq);
            }

            var products = await query
                .Where(p => p.Stock > 0)
                .Take(10)
                .ToListAsync();

            return products.Select(p => new ProductSuggestionDTO
            {
                ProductID = p.ProductId,
                ProductName = p.ProductName,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                Difficulty = p.Difficulty,
                LightRequirement = p.LightRequirement,
                WaterRequirement = p.WaterRequirement
            }).ToList();
        }

        public Task<bool> SaveUserSuggestionAsync(int userId, int productId, string condition, string reason)
        {
            var suggestion = new CareSuggestion
            {
                UserId = userId,
                Condition = condition,
                SuggestedProductId = productId,
                Reason = reason,
                CreatedAt = DateTime.UtcNow
            };

            _context.CareSuggestions.Add(suggestion);
            return Task.FromResult(true);
        }

        public async Task<List<CareSuggestionDTO>> GetUserSuggestionHistoryAsync(int userId)
        {
            return await _context.CareSuggestions
                .Include(cs => cs.SuggestedProduct)
                .Where(cs => cs.UserId == userId)
                .OrderByDescending(cs => cs.CreatedAt)
                .Select(cs => new CareSuggestionDTO
                {
                    SuggestionID = cs.SuggestionId,
                    Condition = cs.Condition,
                    Reason = cs.Reason,
                    SuggestedProduct = new ProductSuggestionDTO
                    {
                        ProductID = cs.SuggestedProduct.ProductId,
                        ProductName = cs.SuggestedProduct.ProductName,
                        Description = cs.SuggestedProduct.Description,
                        Price = cs.SuggestedProduct.Price,
                        ImageUrl = cs.SuggestedProduct.ImageUrl,
                        Difficulty = cs.SuggestedProduct.Difficulty,
                        LightRequirement = cs.SuggestedProduct.LightRequirement,
                        WaterRequirement = cs.SuggestedProduct.WaterRequirement
                    },
                    CreatedAt = cs.CreatedAt ?? DateTime.UtcNow
                })
                .ToListAsync();
        }

        // Helper methods
        private WateringGuideDTO GetWateringGuide(string waterRequirement)
        {
            return waterRequirement switch
            {
                "Ít" => new WateringGuideDTO
                {
                    Frequency = "10-14 ngày một lần",
                    Amount = "Vừa đủ, tránh úng nước",
                    Signs = "Tưới khi đất khô hoàn toàn"
                },
                "Vừa" => new WateringGuideDTO
                {
                    Frequency = "5-7 ngày một lần",
                    Amount = "Trung bình, giữ đất ẩm",
                    Signs = "Tưới khi mặt đất khô"
                },
                "Nhiều" => new WateringGuideDTO
                {
                    Frequency = "2-3 ngày một lần",
                    Amount = "Nhiều, giữ đất luôn ẩm",
                    Signs = "Không để đất khô"
                },
                _ => new WateringGuideDTO
                {
                    Frequency = "7 ngày một lần",
                    Amount = "Vừa phải",
                    Signs = "Kiểm tra độ ẩm đất"
                }
            };
        }

        private FertilizingGuideDTO GetFertilizingGuide()
        {
            return new FertilizingGuideDTO
            {
                Frequency = "30 ngày một lần",
                Type = "Phân NPK hoặc phân hữu cơ",
                Season = "Mùa sinh trưởng (mùa xuân - hè)"
            };
        }

        private LightGuideDTO GetLightGuide(string lightRequirement)
        {
            return lightRequirement switch
            {
                "Thấp" => new LightGuideDTO
                {
                    Requirement = "Ánh sáng yếu, tránh ánh nắng trực tiếp",
                    Duration = "2-4 giờ ánh sáng gián tiếp/ngày",
                    Placement = "Trong nhà, xa cửa sổ"
                },
                "Vừa" => new LightGuideDTO
                {
                    Requirement = "Ánh sáng vừa phải",
                    Duration = "4-6 giờ ánh sáng/ngày",
                    Placement = "Gần cửa sổ, có rèm che"
                },
                "Cao" => new LightGuideDTO
                {
                    Requirement = "Ánh sáng mạnh, có thể chịu nắng trực tiếp",
                    Duration = "6-8 giờ ánh sáng/ngày",
                    Placement = "Cửa sổ hướng nam hoặc ngoài trời"
                },
                _ => new LightGuideDTO
                {
                    Requirement = "Ánh sáng phù hợp",
                    Duration = "4-6 giờ/ngày",
                    Placement = "Tùy loại cây"
                }
            };
        }

        private SoilGuideDTO GetSoilGuide(string soilType)
        {
            return new SoilGuideDTO
            {
                Type = soilType ?? "Đất trồng cây cảnh đa dụng",
                pH = "6.0 - 7.0",
                Drainage = "Thoát nước tốt"
            };
        }

        private List<string> GetCommonIssues(string difficulty)
        {
            var issues = new List<string>
            {
                "Lá vàng: Do tưới nước quá nhiều hoặc thiếu dinh dưỡng",
                "Lá héo: Thiếu nước hoặc nhiệt độ không phù hợp",
                "Sâu bệnh: Kiểm tra thường xuyên và xử lý kịp thời"
            };

            if (difficulty == "Khó")
            {
                issues.Add("Rụng lá: Thay đổi môi trường đột ngột");
                issues.Add("Không ra hoa: Thiếu ánh sáng hoặc dinh dưỡng");
            }

            return issues;
        }

        private List<string> GetCareTips(string difficulty, string waterReq, string lightReq)
        {
            var tips = new List<string>
            {
                "Kiểm tra đất trước khi tưới",
                "Đặt cây ở vị trí ổn định, tránh di chuyển thường xuyên",
                "Vệ sinh lá định kỳ để cây hấp thụ ánh sáng tốt hơn"
            };

            if (difficulty == "Dễ")
            {
                tips.Add("Loại cây dễ chăm sóc, thích hợp cho người mới");
            }

            if (waterReq == "Ít")
            {
                tips.Add("Cây chịu hạn tốt, tốt hơn nên tưới ít hơn tưới nhiều");
            }

            if (lightReq == "Cao")
            {
                tips.Add("Đảm bảo đủ ánh sáng, có thể bổ sung đèn LED nếu cần");
            }

            return tips;
        }

        private string BuildReasonText(UserConditionDTO condition, ProductSuggestionDTO product)
        {
            var reasons = new List<string>();

            if (condition.LightAvailability == product.LightRequirement)
            {
                reasons.Add($"phù hợp với điều kiện ánh sáng {condition.LightAvailability}");
            }

            if (condition.TimeAvailable == "Bận rộn" && product.WaterRequirement == "Ít")
            {
                reasons.Add("không cần tưới nước thường xuyên");
            }

            if (condition.Experience == "Mới" && product.Difficulty == "Dễ")
            {
                reasons.Add("dễ chăm sóc cho người mới bắt đầu");
            }

            return reasons.Count > 0
                ? $"{product.ProductName} {string.Join(", ", reasons)}."
                : $"{product.ProductName} phù hợp với điều kiện của bạn.";
        }
    }
}