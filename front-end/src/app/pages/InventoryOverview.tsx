import { useInventory } from '../context/InventoryContext';
import { calculateInventoryMetrics, formatCurrency } from '../utils/calculations';
import { AlertTriangle, TrendingDown, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

export function InventoryOverview() {
  const { products } = useInventory();
  const metrics = calculateInventoryMetrics(products);

  const summaryCards = [
    {
      title: 'Total Inventory Value',
      value: formatCurrency(metrics.totalInventoryValue),
      description: 'Cash tied up in inventory',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Potential Revenue',
      value: formatCurrency(metrics.totalPotentialRevenue),
      description: 'If all inventory sells',
      icon: TrendingDown,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Potential Profit',
      value: formatCurrency(metrics.totalPotentialProfit),
      description: 'Profit locked in stock',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Risk Alerts',
      value: metrics.lowStockCount + metrics.slowMovingCount,
      description: `${metrics.lowStockCount} low stock, ${metrics.slowMovingCount} slow moving`,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Current State</h2>
        <p className="text-gray-600">Your current inventory situation and financial risk</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl mb-1 text-gray-900">{card.value}</div>
                <p className="text-xs text-gray-500">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Product Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Detailed breakdown of each product in inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Cost/Unit</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead className="text-right">Inventory Value</TableHead>
                  <TableHead className="text-right">Days of Inventory</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const inventoryValue = product.currentStock * product.costPerUnit;
                  const daysOfInventory = product.currentStock / (product.averageDailySales || 1);
                  
                  let status: { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' } = {
                    label: 'Normal',
                    variant: 'default',
                  };

                  if (daysOfInventory < 7) {
                    status = { label: 'Low Stock', variant: 'destructive' };
                  } else if (daysOfInventory > 30) {
                    status = { label: 'Slow Moving', variant: 'secondary' };
                  }

                  return (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.currentStock}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.costPerUnit)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.sellingPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inventoryValue)}</TableCell>
                      <TableCell className="text-right">
                        {daysOfInventory.toFixed(1)} days
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
