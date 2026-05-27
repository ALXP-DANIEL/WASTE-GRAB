export type WasteCategory = {
  id: string;
  name: string;
  pointsPerKg: number;
  averageWeightKg: string; // Decimal as string
  isBanned: boolean;
  isHazardous: boolean;
  isAiDetectable: boolean;
  description: string | null;
};

export type CreateWasteCategoryInput = {
  name: string;
  pointsPerKg?: number;
  averageWeightKg?: string;
  isBanned?: boolean;
  isHazardous?: boolean;
  isAiDetectable?: boolean;
  description?: string;
};

export type UpdateWasteCategoryInput = {
  name?: string;
  pointsPerKg?: number;
  averageWeightKg?: string;
  isBanned?: boolean;
  isHazardous?: boolean;
  isAiDetectable?: boolean;
  description?: string;
};
