export type WasteCategory = {
  id: string;
  name: string;
  pricePerKg: string; // Decimal as string
  pointsPerKg: number;
  averageWeightKg: string; // Decimal as string
  isBanned: boolean;
  isHazardous: boolean;
  isAiDetectable: boolean;
  description: string | null;
};

export type CreateWasteCategoryInput = {
  name: string;
  pricePerKg: string;
  pointsPerKg?: number;
  averageWeightKg?: string;
  isBanned?: boolean;
  isHazardous?: boolean;
  isAiDetectable?: boolean;
  description?: string;
};

export type UpdateWasteCategoryInput = {
  name?: string;
  pricePerKg?: string;
  pointsPerKg?: number;
  averageWeightKg?: string;
  isBanned?: boolean;
  isHazardous?: boolean;
  isAiDetectable?: boolean;
  description?: string;
};
