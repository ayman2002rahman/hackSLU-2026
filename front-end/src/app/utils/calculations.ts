import { Product, InventoryMetrics, DemandForecast, RestockRecommendation } from '../types/inventory';

export function calculateInventoryMetrics(products: Product[]): InventoryMetrics {
  let totalInventoryValue = 0;
  let totalPotentialRevenue = 0;
  let totalPotentialProfit = 0;
  let lowStockCount = 0;
  let slowMovingCount = 0;

  products.forEach((product) => {
    const inventoryValue = product.currentStock * product.costPerUnit;
    const potentialRevenue = product.currentStock * product.sellingPrice;
    const potentialProfit = product.currentStock * (product.sellingPrice - product.costPerUnit);

    totalInventoryValue += inventoryValue;
    totalPotentialRevenue += potentialRevenue;
    totalPotentialProfit += potentialProfit;

    // Low stock: less than 7 days of inventory
    const daysOfInventory = product.currentStock / (product.averageDailySales || 1);
    if (daysOfInventory < 7) {
      lowStockCount++;
    }

    // Slow moving: more than 30 days of inventory
    if (daysOfInventory > 30) {
      slowMovingCount++;
    }
  });

  return {
    totalInventoryValue,
    totalPotentialRevenue,
    totalPotentialProfit,
    lowStockCount,
    slowMovingCount,
  };
}

export function calculateDemandForecast(
  products: Product[],
  forecastDays: number = 14
): DemandForecast[] {
  return products.map((product) => {
    const forecastDemand = product.averageDailySales * forecastDays;
    const daysUntilStockout = product.currentStock / (product.averageDailySales || 1);
    const shortageAmount = Math.max(0, forecastDemand - product.currentStock);

    let estimatedStockoutDate: string | null = null;
    if (product.averageDailySales > 0) {
      const stockoutDate = new Date();
      stockoutDate.setDate(stockoutDate.getDate() + Math.floor(daysUntilStockout));
      estimatedStockoutDate = stockoutDate.toISOString().split('T')[0];
    }

    return {
      productId: product.id,
      currentStock: product.currentStock,
      averageDailySales: product.averageDailySales,
      forecastDemand,
      estimatedStockoutDate,
      shortageAmount,
    };
  });
}

export function calculateRestockRecommendations(
  products: Product[],
  forecastDays: number,
  budget: number
): RestockRecommendation[] {
  // Calculate needs and profit at risk for each product
  const recommendations = products
    .map((product) => {
      const forecastDemand = product.averageDailySales * forecastDays;
      const unitsNeeded = Math.max(0, forecastDemand - product.currentStock);
      
      if (unitsNeeded === 0) {
        return null;
      }

      const profitPerUnit = product.sellingPrice - product.costPerUnit;
      const profitAtRisk = unitsNeeded * profitPerUnit;
      const totalCost = unitsNeeded * product.costPerUnit;
      const expectedRevenue = unitsNeeded * product.sellingPrice;
      const expectedProfit = unitsNeeded * profitPerUnit;

      // Determine reason
      const daysOfInventory = product.currentStock / (product.averageDailySales || 1);
      let reason = '';
      if (daysOfInventory < 3) {
        reason = 'Critical: Will run out in less than 3 days';
      } else if (daysOfInventory < 7) {
        reason = 'High demand and low remaining stock';
      } else if (profitPerUnit / product.costPerUnit > 0.5) {
        reason = 'High profit margin opportunity';
      } else {
        reason = 'Prevent stockout during forecast period';
      }

      return {
        productId: product.id,
        productName: product.name,
        suggestedQuantity: unitsNeeded,
        totalCost,
        expectedRevenue,
        expectedProfit,
        reason,
        profitAtRisk,
      };
    })
    .filter((rec): rec is RestockRecommendation => rec !== null);

  // Sort by profit at risk (highest first)
  recommendations.sort((a, b) => b.profitAtRisk - a.profitAtRisk);

  // Apply budget constraint
  let remainingBudget = budget;
  const finalRecommendations: RestockRecommendation[] = [];

  for (const rec of recommendations) {
    if (rec.totalCost <= remainingBudget) {
      finalRecommendations.push(rec);
      remainingBudget -= rec.totalCost;
    } else if (remainingBudget > 0) {
      // Partial order
      const product = products.find((p) => p.id === rec.productId);
      if (product) {
        const affordableQuantity = Math.floor(remainingBudget / product.costPerUnit);
        if (affordableQuantity > 0) {
          const profitPerUnit = product.sellingPrice - product.costPerUnit;
          finalRecommendations.push({
            ...rec,
            suggestedQuantity: affordableQuantity,
            totalCost: affordableQuantity * product.costPerUnit,
            expectedRevenue: affordableQuantity * product.sellingPrice,
            expectedProfit: affordableQuantity * profitPerUnit,
            reason: rec.reason + ' (partial order due to budget)',
          });
          remainingBudget = 0;
        }
      }
    }
  }

  return finalRecommendations;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
