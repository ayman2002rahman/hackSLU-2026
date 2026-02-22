export interface Product {
  id: string;
  name: string;
  currentStock: number;
  costPerUnit: number;
  sellingPrice: number;
  averageDailySales: number;
}

export interface InventoryMetrics {
  totalInventoryValue: number;
  totalPotentialRevenue: number;
  totalPotentialProfit: number;
  lowStockCount: number;
  slowMovingCount: number;
}

export interface DemandForecast {
  productId: string;
  currentStock: number;
  averageDailySales: number;
  forecastDemand: number;
  estimatedStockoutDate: string | null;
  shortageAmount: number;
}

export interface RestockRecommendation {
  productId: string;
  productName: string;
  suggestedQuantity: number;
  totalCost: number;
  expectedRevenue: number;
  expectedProfit: number;
  reason: string;
  profitAtRisk: number;
}
