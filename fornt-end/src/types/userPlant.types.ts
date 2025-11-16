
export interface UserPlantDTO {
  userPlantID: number;
  userID: number;
  productID: number;        // ⭐ Đổi lại productId → productID
  productName: string;
  nickname?: string;
  plantedDate?: string;     // DateOnly từ C# → string "YYYY-MM-DD"
  lastWatered?: string;
  lastFertilized?: string;
  notes?: string;
  status?: string;
  imageUrl?: string;
  difficulty?: string;
  lightRequirement?: string;
  waterRequirement?: string;
  createdAt: string;        // DateTime từ C# → ISO string
}

export interface UserPlantDetailDTO {
  userPlantID: number;
  nickname?: string;
  plantedDate?: string;
  lastWatered?: string;
  lastFertilized?: string;
  notes?: string;
  status?: string;
  daysSincePlanted: number;
  daysSinceWatered: number;
  daysSinceFertilized: number;
  product: ProductInfoDTO;
  upcomingReminders: ReminderDTO[];
}

export interface ProductInfoDTO {
  productID: number;        // ⭐ Đổi lại
  productName: string;
  description?: string;
  imageUrl?: string;
  difficulty?: string;
  lightRequirement?: string;
  waterRequirement?: string;
  soilType?: string;
}

export interface ReminderDTO {
  reminderID: number;
  reminderType: string;
  message?: string;
  reminderDate: string;
  isCompleted: boolean;
}

export interface UserPlantStatisticsDTO {
  totalPlants: number;
  alivePlants: number;
  deadPlants: number;
  plantsNeedWatering: number;
  plantsNeedFertilizing: number;
}

// ⭐ WRITE DTOs (gửi lên API) - PHẢI DÙNG PascalCase
export interface CreateUserPlantDTO {
  productID: number;        // ⭐ Backend expects ProductID (PascalCase)
  nickname?: string;
  plantedDate?: string | null;  // "YYYY-MM-DD" hoặc null
  notes?: string;
}

export interface UpdateUserPlantDTO {
  userPlantID: number;
  nickname?: string;
  plantedDate?: string;     // ⭐ Thêm field này (thiếu trong code cũ)
  lastWatered?: string;
  lastFertilized?: string;
  notes?: string;
  status?: string;
}

export interface UpdateCareDTO {
  date: string;             // ISO DateTime string
}

export interface UpdateStatusDTO {
  status: string;           // "Đang sống" | "Chết" | "Đã tặng" | "Đã bán"
}

// ============================================
// Care Suggestion & Guide DTOs
// ============================================

export interface PlantCareGuideDTO {
  productID: number;        // ⭐ Đổi lại
  productName: string;
  generalCare?: string;
  wateringGuide: WateringGuideDTO;
  fertilizingGuide: FertilizingGuideDTO;
  lightGuide: LightGuideDTO;
  soilGuide: SoilGuideDTO;
  commonIssues: string[];
  tips: string[];
}

export interface WateringGuideDTO {
  frequency: string;
  amount: string;
  signs: string;
}

export interface FertilizingGuideDTO {
  frequency: string;
  type: string;
  season: string;
}

export interface LightGuideDTO {
  requirement: string;
  duration: string;
  placement: string;
}

export interface SoilGuideDTO {
  type: string;
  pH: string;
  drainage: string;
}

export interface UserConditionDTO {
  lightAvailability?: string;
  timeAvailable?: string;
  experience?: string;
  preferredTypes?: string[];
}

export interface CareSuggestionDTO {
  suggestionID: number;
  condition?: string;
  reason?: string;
  suggestedProduct: ProductSuggestionDTO;
  createdAt: string;
}

export interface ProductSuggestionDTO {
  productID: number;        // ⭐ Đổi lại
  productName: string;
  description?: string;
  price: number;
  imageUrl?: string;
  difficulty?: string;
  lightRequirement?: string;
  waterRequirement?: string;
}

