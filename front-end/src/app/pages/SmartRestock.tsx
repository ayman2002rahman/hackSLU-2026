import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { calculateRestockRecommendations, formatCurrency } from '../utils/calculations';
import { ShoppingCart, DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

export function SmartRestock() {
  const { products } = useInventory();
  const [budget, setBudget] = useState<string>('1000');
  const [forecastDays, setForecastDays] = useState<number>(14);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const recommendations = calculateRestockRecommendations(products, forecastDays, Number(budget) || 0);

  const totalCost = recommendations.reduce((sum, rec) => sum + rec.totalCost, 0);
  const totalExpectedRevenue = recommendations.reduce((sum, rec) => sum + rec.expectedRevenue, 0);
  const totalExpectedProfit = recommendations.reduce((sum, rec) => sum + rec.expectedProfit, 0);
  const remainingBudget = Number(budget) - totalCost;

  const handleCalculate = () => {
    setShowRecommendations(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Optimal Action</h2>
        <p className="text-gray-600">Smart restocking recommendations optimized for your budget</p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Restock Plan</CardTitle>
          <CardDescription>Set your budget and forecast period to get optimized recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="budget">Available Budget</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-9"
                  placeholder="1000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forecast-period">Forecast Period</Label>
              <Select value={forecastDays.toString()} onValueChange={(val) => setForecastDays(Number(val))}>
                <SelectTrigger id="forecast-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleCalculate} className="w-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Calculate Recommendations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {showRecommendations && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl mb-1 text-gray-900">{formatCurrency(totalCost)}</div>
                <p className="text-xs text-gray-500">From {formatCurrency(Number(budget))} budget</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Expected Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl mb-1 text-green-600">{formatCurrency(totalExpectedRevenue)}</div>
                <p className="text-xs text-gray-500">Protected sales</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Expected Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl mb-1 text-purple-600">{formatCurrency(totalExpectedProfit)}</div>
                <p className="text-xs text-gray-500">
                  {totalCost > 0 ? `${((totalExpectedProfit / totalCost) * 100).toFixed(1)}% ROI` : '0% ROI'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Remaining Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl mb-1 text-gray-900">{formatCurrency(remainingBudget)}</div>
                <p className="text-xs text-gray-500">
                  {recommendations.length} product{recommendations.length !== 1 ? 's' : ''} recommended
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations List */}
          {recommendations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Orders</CardTitle>
                <CardDescription>Prioritized by profit at risk and stock urgency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={rec.productId}
                      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm text-blue-700">#{index + 1}</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-gray-900 mb-1">{rec.productName}</h4>
                            <p className="text-sm text-gray-600">{rec.reason}</p>
                          </div>
                          <Badge variant="outline" className="ml-4 flex-shrink-0">
                            Priority {index + 1}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Order Quantity</p>
                            <p className="text-sm text-gray-900">{rec.suggestedQuantity} units</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Cost</p>
                            <p className="text-sm text-gray-900">{formatCurrency(rec.totalCost)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Expected Revenue</p>
                            <p className="text-sm text-green-600">{formatCurrency(rec.expectedRevenue)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Expected Profit</p>
                            <p className="text-sm text-purple-600">{formatCurrency(rec.expectedProfit)}</p>
                          </div>
                        </div>
                      </div>

                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="pt-12 pb-12 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No restocking needed</p>
                <p className="text-sm text-gray-500">
                  All products have sufficient stock for the {forecastDays}-day forecast period.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info Box */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>How it works:</strong> Products are ranked by profit at risk (potential profit loss from
                    stockouts).
                  </p>
                  <p className="text-sm text-gray-700">
                    The system recommends orders within your budget, prioritizing items that protect the most profit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
