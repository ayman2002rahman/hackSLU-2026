import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency } from '../utils/calculations';
import { Send, CheckCircle2, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { ScrollArea } from '../components/ui/scroll-area';
import { Textarea } from '../components/ui/textarea';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  costPerUnit: number;
  totalCost: number;
}

export function SendOrders() {
  const { products } = useInventory();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [vendorEmail, setVendorEmail] = useState('vendor@example.com');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
      // Initialize quantity if not set
      if (!quantities[productId]) {
        setQuantities({ ...quantities, [productId]: 1 });
      }
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setQuantities({ ...quantities, [productId]: quantity });
  };

  const orderItems: OrderItem[] = Array.from(selectedProducts)
    .map((productId) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return null;
      
      const quantity = quantities[productId] || 1;
      return {
        productId,
        productName: product.name,
        quantity,
        costPerUnit: product.costPerUnit,
        totalCost: quantity * product.costPerUnit,
      };
    })
    .filter((item): item is OrderItem => item !== null);

  const totalOrderCost = orderItems.reduce((sum, item) => sum + item.totalCost, 0);

  const handleSendOrder = () => {
    // In a real application, this would send the order via email or API
    console.log('Sending order to:', vendorEmail);
    console.log('Order items:', orderItems);
    console.log('Notes:', orderNotes);
    
    setOrderSent(true);
    setTimeout(() => {
      setOrderSent(false);
      setSelectedProducts(new Set());
      setQuantities({});
      setOrderNotes('');
    }, 3000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Send Orders to Vendor</h2>
        <p className="text-gray-600">Select products and quantities to create a purchase order</p>
      </div>

      {/* Vendor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
          <CardDescription>Enter vendor contact details for order delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-email">Vendor Email</Label>
              <Input
                id="vendor-email"
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="vendor@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-notes">Order Notes (Optional)</Label>
              <Textarea
                id="order-notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add any special instructions or notes for the vendor..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Products to Order</CardTitle>
          <CardDescription>Choose products and specify quantities</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Cost/Unit</TableHead>
                  <TableHead className="text-right w-32">Order Quantity</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const isSelected = selectedProducts.has(product.id);
                  const quantity = quantities[product.id] || 1;
                  const totalCost = quantity * product.costPerUnit;

                  return (
                    <TableRow key={product.id} className={isSelected ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.currentStock}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.costPerUnit)}</TableCell>
                      <TableCell className="text-right">
                        {isSelected ? (
                          <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="w-24 text-right"
                          />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelected ? (
                          <span className="text-gray-900">{formatCurrency(totalCost)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
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

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your order before sending to vendor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Items</p>
                    <p className="text-2xl text-gray-900">{orderItems.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Units</p>
                    <p className="text-2xl text-gray-900">
                      {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Total Order Cost</p>
                  <p className="text-3xl text-gray-900">{formatCurrency(totalOrderCost)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm text-gray-700">Items in Order:</h4>
                <div className="space-y-1">
                  {orderItems.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm py-2 border-b border-gray-100">
                      <span className="text-gray-700">{item.productName}</span>
                      <span className="text-gray-900">
                        {item.quantity} × {formatCurrency(item.costPerUnit)} = {formatCurrency(item.totalCost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSendOrder} 
                className="w-full" 
                size="lg"
                disabled={orderSent}
              >
                {orderSent ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Order Sent Successfully!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Purchase Order to Vendor
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {orderItems.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No products selected</p>
            <p className="text-sm text-gray-500">
              Select products from the table above to create a purchase order
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
