import { useInventory } from '../context/InventoryContext';
import { calculateInventoryMetrics, formatCurrency } from '../utils/calculations';
import { TrendingDown, DollarSign, RotateCcw, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useState } from 'react';
import { Product } from '../types/inventory';

export function InventoryOverview() {
  const { products, updateProduct } = useInventory();
  const metrics = calculateInventoryMetrics(products);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const handleResetData = () => {
    localStorage.removeItem('inventory_products');
    window.location.reload();
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      currentStock: product.currentStock,
      costPerUnit: product.costPerUnit,
      sellingPrice: product.sellingPrice,
      averageDailySales: product.averageDailySales,
    });
  };

  const handleSave = (id: string) => {
    updateProduct(id, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

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
          <CardDescription>Detailed breakdown of each product in inventory (click edit to modify)</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Cost/Unit</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead className="text-right">Avg Daily Sales</TableHead>
                  <TableHead className="text-right">Inventory Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const isEditing = editingId === product.id;
                  const inventoryValue = product.currentStock * product.costPerUnit;

                  return (
                    <TableRow key={product.id} className={isEditing ? 'bg-blue-50' : ''}>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full"
                          />
                        ) : (
                          product.name
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editForm.currentStock || 0}
                            onChange={(e) => setEditForm({ ...editForm, currentStock: Number(e.target.value) })}
                            className="w-24 text-right"
                          />
                        ) : (
                          product.currentStock
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editForm.costPerUnit || 0}
                            onChange={(e) => setEditForm({ ...editForm, costPerUnit: Number(e.target.value) })}
                            className="w-24 text-right"
                          />
                        ) : (
                          formatCurrency(product.costPerUnit)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editForm.sellingPrice || 0}
                            onChange={(e) => setEditForm({ ...editForm, sellingPrice: Number(e.target.value) })}
                            className="w-24 text-right"
                          />
                        ) : (
                          formatCurrency(product.sellingPrice)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editForm.averageDailySales || 0}
                            onChange={(e) => setEditForm({ ...editForm, averageDailySales: Number(e.target.value) })}
                            className="w-24 text-right"
                          />
                        ) : (
                          product.averageDailySales
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(inventoryValue)}</TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSave(product.id)}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Reset Data Button */}
      <div className="flex justify-end">
        <Button
          variant="destructive"
          onClick={handleResetData}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Data
        </Button>
      </div>
    </div>
  );
}
