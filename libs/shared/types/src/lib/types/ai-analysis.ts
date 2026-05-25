export type DetectedWasteCategory = {
  id: string;
  name: string;
  count: number;
  estimatedWeight: number;
  points: number;
};

export type AnalyzeImageResult = {
  detectedWaste: string[];
  detectedCategories: DetectedWasteCategory[];
  counts: Record<string, number>;
  totalItems: number;
  estimatedWeight: number;
  points: number;
  size: 'Small' | 'Medium' | 'Large';
  recyclable: 'Yes' | 'No';
};

export type AnalyzeImageResponse = {
  success: boolean;
  result?: AnalyzeImageResult;
  error?: string;
};
