import { useInventory } from '../context/InventoryContext';
import { calculateInventoryMetrics, formatCurrency } from '../utils/calculations';
import { TrendingDown, DollarSign, RotateCcw, Edit2, Save, X, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useState } from 'react';
import { Product } from '../types/inventory';

const emptyNewProduct: Omit<Product, 'id'> = {
  name: '',
  currentStock: 0,
  costPerUnit: 0,
  sellingPrice: 0,
  averageDailySales: 0,
};

export function InventoryOverview() {
  const { products, loading, error, refetch, updateProduct, deleteProduct, addProduct } = useInventory();
  const metrics = calculateInventoryMetrics(products);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(emptyNewProduct);
  const [addError, setAddError] = useState<string | null>(null);

  const handleRefresh = () => refetch();

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      currentStock: product.currentStock,
      costPerUnit: product.costPerUnit,
      sellingPrice: product.sellingPrice,
      averageDailySales: product.averageDailySales,
    });
    setSaveError(null);
  };

  const handleSave = async (id: string) => {
    setSaveError(null);
    try {
      await updateProduct(id, editForm);
      setEditingId(null);
      setEditForm({});
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setSaveError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this product from inventory?')) return;
    setSaveError(null);
    try {
      await deleteProduct(id);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) return;
    setAddError(null);
    try {
      await addProduct(newProduct);
      setNewProduct(emptyNewProduct);
      setShowAddForm(false);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to add product');
    }
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

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-700">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <p className="text-gray-500">Loading products…</p>
      )}

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

      {/* Add Product */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Product
          </CardTitle>
          <CardDescription>Add a new product to inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {showAddForm ? (
            <div className="space-y-4">
              {addError && <p className="text-sm text-red-600">{addError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Organic Coffee"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Stock</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newProduct.currentStock || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost/Unit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={newProduct.costPerUnit || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, costPerUnit: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Selling Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={newProduct.sellingPrice || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avg Daily Sales</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newProduct.averageDailySales || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, averageDailySales: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddProduct} disabled={!newProduct.name.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Save Product
                </Button>
                <Button variant="outline" onClick={() => { setShowAddForm(false); setAddError(null); setNewProduct(emptyNewProduct); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Product Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Detailed breakdown of each product in inventory (click edit to modify). Inventory Value is derived (current stock × cost/unit).</CardDescription>
        </CardHeader>
        <CardContent>
          {saveError && <p className="text-sm text-red-600 mb-4">{saveError}</p>}
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
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
