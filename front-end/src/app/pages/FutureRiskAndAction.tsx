import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { calculateDemandForecast, formatCurrency } from '../utils/calculations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ScrollArea } from '../components/ui/scroll-area';
import { Calendar, Cloud, TrendingUp, AlertCircle } from 'lucide-react';

export function FutureRiskAndAction() {
  const { products } = useInventory();
  const [forecastDays, setForecastDays] = useState<number>(14);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Context gathering form
  const [contextData, setContextData] = useState({
    upcomingHolidays: '',
    weatherForecast: '',
    specialEvents: '',
    seasonalTrends: '',
    budget: '1000',
  });

  const forecasts = calculateDemandForecast(products, forecastDays);

  // Prepare chart data for selected product
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const chartData = selectedProduct
    ? Array.from({ length: forecastDays }, (_, i) => {
        const currentDay = i + 1;
        const projectedStock = Math.max(
          0,
          selectedProduct.currentStock - selectedProduct.averageDailySales * currentDay
        );
        const projectedDemand = selectedProduct.averageDailySales * currentDay;

        return {
          day: `Day ${currentDay}`,
          stock: Math.round(projectedStock),
          demand: Math.round(projectedDemand),
        };
      })
    : [];

  // Table 1: Stockout Risk
  const stockoutRisk = products
    .map((product) => {
      const forecast = forecasts.find((f) => f.productId === product.id);
      if (!forecast || forecast.shortageAmount === 0) return null;

      const daysToStockout = product.currentStock / (product.averageDailySales || 1);
      const profitPerUnit = product.sellingPrice - product.costPerUnit;
      const profitAtRisk = forecast.shortageAmount * profitPerUnit;

      // Determine criticality based on days to stockout
      let criticality: { label: string; variant: 'default' | 'destructive' | 'secondary' } = {
        label: 'Low',
        variant: 'secondary',
      };

      if (daysToStockout < 7) {
        criticality = { label: 'High', variant: 'destructive' };
      } else if (daysToStockout < 14) {
        criticality = { label: 'Medium', variant: 'default' };
      }

      return {
        product: product.name,
        currentStock: product.currentStock,
        forecast: Math.round(forecast.forecastDemand),
        shortageUnits: Math.round(forecast.shortageAmount),
        criticality: criticality,
        profitAtRisk: profitAtRisk,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.profitAtRisk - a.profitAtRisk);

  // Table 2: Overstock / Cash Trapped
  const overstockData = products
    .map((product) => {
      const daysOfInventory = product.currentStock / (product.averageDailySales || 1);
      const inventoryValue = product.currentStock * product.costPerUnit;
      
      if (daysOfInventory <= 14) return null;

      const cashTrappedScore = daysOfInventory * inventoryValue;

      return {
        product: product.name,
        currentStock: product.currentStock,
        avgDailySales: product.averageDailySales,
        daysOfInventory: daysOfInventory,
        inventoryValue: inventoryValue,
        cashTrappedScore: cashTrappedScore,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.cashTrappedScore - a.cashTrappedScore);

  // Restock recommendations
  const calculateRecommendations = () => {
    const budgetAmount = Number(contextData.budget) || 0;

    const recommendations = products
      .map((product) => {
        const forecast = forecasts.find((f) => f.productId === product.id);
        if (!forecast || forecast.shortageAmount === 0) return null;

        const unitsToOrder = Math.round(forecast.shortageAmount);
        const restockCost = unitsToOrder * product.costPerUnit;
        const profitPerUnit = product.sellingPrice - product.costPerUnit;
        const profitProtected = unitsToOrder * profitPerUnit;
        const roiPerDollar = restockCost > 0 ? profitProtected / restockCost : 0;

        return {
          productName: product.name,
          unitsToOrder,
          restockCost,
          profitProtected,
          roiPerDollar,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.roiPerDollar - a.roiPerDollar);

    // Apply budget constraint
    let remainingBudget = budgetAmount;
    const finalRecommendations = [];

    for (const rec of recommendations) {
      if (rec.restockCost <= remainingBudget) {
        finalRecommendations.push(rec);
        remainingBudget -= rec.restockCost;
      } else if (remainingBudget > 0) {
        const product = products.find((p) => p.name === rec.productName);
        if (product) {
          const affordableUnits = Math.floor(remainingBudget / product.costPerUnit);
          if (affordableUnits > 0) {
            const profitPerUnit = product.sellingPrice - product.costPerUnit;
            const partialCost = affordableUnits * product.costPerUnit;
            const partialProfit = affordableUnits * profitPerUnit;
            
            finalRecommendations.push({
              productName: rec.productName,
              unitsToOrder: affordableUnits,
              restockCost: partialCost,
              profitProtected: partialProfit,
              roiPerDollar: partialProfit / partialCost,
            });
            remainingBudget = 0;
          }
        }
      }
    }

    return finalRecommendations;
  };

  const recommendations = showAnalysis ? calculateRecommendations() : [];
  const totalBudgetUsed = recommendations.reduce((sum, rec) => sum + rec.restockCost, 0);
  const totalProfitProtected = recommendations.reduce((sum, rec) => sum + rec.profitProtected, 0);

  const handleAnalyze = () => {
    setShowAnalysis(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Future Risk & Action</h2>
        <p className="text-gray-600">Analyze risks and get smart restocking recommendations</p>
      </div>

      {/* Context Gathering Section */}
      {!showAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Business Context</CardTitle>
            <CardDescription>
              Provide information about upcoming events, weather, and trends to improve forecast accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="holidays" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Upcoming Holidays / Events
                  </Label>
                  <Textarea
                    id="holidays"
                    placeholder="e.g., Christmas in 2 weeks, Valentine's Day next month"
                    value={contextData.upcomingHolidays}
                    onChange={(e) => setContextData({ ...contextData, upcomingHolidays: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weather" className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    Weather Forecast
                  </Label>
                  <Textarea
                    id="weather"
                    placeholder="e.g., Hot weather expected next week, rainy season starting"
                    value={contextData.weatherForecast}
                    onChange={(e) => setContextData({ ...contextData, weatherForecast: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="events">Special Events / Promotions</Label>
                  <Textarea
                    id="events"
                    placeholder="e.g., Store anniversary sale, new product launch"
                    value={contextData.specialEvents}
                    onChange={(e) => setContextData({ ...contextData, specialEvents: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trends">Seasonal Trends</Label>
                  <Textarea
                    id="trends"
                    placeholder="e.g., Summer drinks sell more, winter clothing demand increasing"
                    value={contextData.seasonalTrends}
                    onChange={(e) => setContextData({ ...contextData, seasonalTrends: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="forecast-days">Forecast Period</Label>
                  <Select value={forecastDays.toString()} onValueChange={(val) => setForecastDays(Number(val))}>
                    <SelectTrigger id="forecast-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Available Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={contextData.budget}
                    onChange={(e) => setContextData({ ...contextData, budget: e.target.value })}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleAnalyze} size="lg">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze Risk & Generate Recommendations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {showAnalysis && (
        <>
          {/* Context Summary */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Analysis Context:</strong> {forecastDays}-day forecast with ${contextData.budget} budget
                  </p>
                  {(contextData.upcomingHolidays || contextData.weatherForecast || contextData.specialEvents || contextData.seasonalTrends) && (
                    <div className="text-sm text-gray-700 space-y-1">
                      {contextData.upcomingHolidays && <p>• Holidays/Events: {contextData.upcomingHolidays}</p>}
                      {contextData.weatherForecast && <p>• Weather: {contextData.weatherForecast}</p>}
                      {contextData.specialEvents && <p>• Special Events: {contextData.specialEvents}</p>}
                      {contextData.seasonalTrends && <p>• Seasonal Trends: {contextData.seasonalTrends}</p>}
                    </div>
                  )}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 mt-2"
                    onClick={() => setShowAnalysis(false)}
                  >
                    Edit Context
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Demand Projection</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-4">
                  <span>Visualize stock vs. demand over time</span>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="stock" stroke="#3b82f6" name="Projected Stock" strokeWidth={2} />
                  <Line type="monotone" dataKey="demand" stroke="#f59e0b" name="Cumulative Demand" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table 1: Stockout Risk */}
          <Card>
            <CardHeader>
              <CardTitle>Stockout Risk (Money We Might Lose)</CardTitle>
              <CardDescription>
                If we do nothing, these products will cost us money
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockoutRisk.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Forecast ({forecastDays} days)</TableHead>
                        <TableHead className="text-right">Shortage Units</TableHead>
                        <TableHead className="text-right">Criticality</TableHead>
                        <TableHead className="text-right">Profit at Risk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockoutRisk.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product}</TableCell>
                          <TableCell className="text-right">{item.currentStock}</TableCell>
                          <TableCell className="text-right">{item.forecast}</TableCell>
                          <TableCell className="text-right text-orange-600">{item.shortageUnits}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={item.criticality.variant}>{item.criticality.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(item.profitAtRisk)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No stockout risk for the {forecastDays}-day forecast period
                </p>
              )}
            </CardContent>
          </Card>

          {/* Table 2: Overstock / Cash Trapped */}
          <Card>
            <CardHeader>
              <CardTitle>Overstock / Cash Trapped (Money Sitting Idle)</CardTitle>
              <CardDescription>
                Where capital is locked up and not moving
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overstockData.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Avg Daily Sales</TableHead>
                        <TableHead className="text-right">Days of Inventory</TableHead>
                        <TableHead className="text-right">Inventory Value</TableHead>
                        <TableHead className="text-right">Cash Trapped Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overstockData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product}</TableCell>
                          <TableCell className="text-right">{item.currentStock}</TableCell>
                          <TableCell className="text-right">{item.avgDailySales}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-orange-600">{item.daysOfInventory.toFixed(1)}</span>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.inventoryValue)}</TableCell>
                          <TableCell className="text-right">
                            {item.cashTrappedScore.toFixed(0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No overstock issues detected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recommended Restock Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Restock Plan</CardTitle>
              <CardDescription>Prioritized by ROI per dollar (profit protected per dollar spent)</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Units to Order</TableHead>
                          <TableHead className="text-right">Restock Cost</TableHead>
                          <TableHead className="text-right">Expected Profit Protected</TableHead>
                          <TableHead className="text-right">ROI per Dollar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recommendations.map((rec, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm">
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell>{rec.productName}</TableCell>
                            <TableCell className="text-right">{rec.unitsToOrder}</TableCell>
                            <TableCell className="text-right">{formatCurrency(rec.restockCost)}</TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(rec.profitProtected)}
                            </TableCell>
                            <TableCell className="text-right text-purple-600">
                              ${rec.roiPerDollar.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {/* Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Budget Used</p>
                        <p className="text-2xl text-gray-900">{formatCurrency(totalBudgetUsed)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          of {formatCurrency(Number(contextData.budget))} available
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Profit Protected</p>
                        <p className="text-2xl text-green-600">{formatCurrency(totalProfitProtected)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {totalBudgetUsed > 0
                            ? `${((totalProfitProtected / totalBudgetUsed) * 100).toFixed(1)}% overall ROI`
                            : '0% overall ROI'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No restocking needed for the {forecastDays}-day forecast period
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}