import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { calculateDemandForecast, formatDate } from '../utils/calculations';
import { AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function DemandForecast() {
  const { products } = useInventory();
  const [forecastDays, setForecastDays] = useState<number>(14);
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Future Risk</h2>
          <p className="text-gray-600">Predict what will sell and when you'll run out</p>
        </div>
        <Select value={forecastDays.toString()} onValueChange={(val) => setForecastDays(Number(val))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Days</SelectItem>
            <SelectItem value="14">14 Days</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {/* Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Details</CardTitle>
          <CardDescription>Projected demand and stockout dates for {forecastDays} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Avg Daily Sales</TableHead>
                  <TableHead className="text-right">{forecastDays}-Day Demand</TableHead>
                  <TableHead>Estimated Stockout</TableHead>
                  <TableHead className="text-right">Shortage Amount</TableHead>
                  <TableHead>Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts.map((forecast) => {
                  const product = products.find((p) => p.id === forecast.productId);
                  if (!product) return null;

                  const daysUntilStockout = forecast.currentStock / (forecast.averageDailySales || 1);
                  let riskLevel: { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' } = {
                    label: 'Low Risk',
                    variant: 'default',
                  };

                  if (daysUntilStockout < 3) {
                    riskLevel = { label: 'Critical', variant: 'destructive' };
                  } else if (daysUntilStockout < 7) {
                    riskLevel = { label: 'High Risk', variant: 'destructive' };
                  } else if (forecast.shortageAmount > 0) {
                    riskLevel = { label: 'Medium Risk', variant: 'secondary' };
                  }

                  return (
                    <TableRow key={forecast.productId}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{forecast.currentStock}</TableCell>
                      <TableCell className="text-right">{forecast.averageDailySales}</TableCell>
                      <TableCell className="text-right">{Math.round(forecast.forecastDemand)}</TableCell>
                      <TableCell>
                        {forecast.estimatedStockoutDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{formatDate(forecast.estimatedStockoutDate)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {forecast.shortageAmount > 0 ? (
                          <span className="text-orange-600">{Math.round(forecast.shortageAmount)}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={riskLevel.variant}>{riskLevel.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 mb-2">
                This forecast is predictive only. It shows you what will likely happen based on current sales patterns.
              </p>
              <p className="text-sm text-gray-700">
                Go to the <strong>Optimal Action</strong> section to get smart restocking recommendations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
