import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/inventory';

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY = 'inventory_products';

const defaultProducts: Product[] = [
  { id: '1', name: 'Organic Coffee Beans', currentStock: 120, costPerUnit: 8.50, sellingPrice: 15.99, averageDailySales: 12 },
  { id: '2', name: 'Artisan Bread Loaves', currentStock: 45, costPerUnit: 3.20, sellingPrice: 6.50, averageDailySales: 18 },
  { id: '3', name: 'Natural Honey Jars', currentStock: 8, costPerUnit: 5.00, sellingPrice: 12.00, averageDailySales: 3 },
  { id: '4', name: 'Handmade Soap Bars', currentStock: 200, costPerUnit: 2.50, sellingPrice: 6.99, averageDailySales: 5 },
  { id: '5', name: 'Fresh Juice Bottles', currentStock: 30, costPerUnit: 2.00, sellingPrice: 5.50, averageDailySales: 15 },
  { id: '6', name: 'Vintage T-Shirts', currentStock: 75, costPerUnit: 8.00, sellingPrice: 24.99, averageDailySales: 8 },
  { id: '7', name: 'Greek Yogurt Cups', currentStock: 90, costPerUnit: 1.50, sellingPrice: 3.99, averageDailySales: 22 },
  { id: '8', name: 'Almond Butter Jars', currentStock: 55, costPerUnit: 6.00, sellingPrice: 13.99, averageDailySales: 7 },
  { id: '9', name: 'Herbal Tea Boxes', currentStock: 140, costPerUnit: 4.25, sellingPrice: 9.99, averageDailySales: 11 },
  { id: '10', name: 'Dark Chocolate Bars', currentStock: 25, costPerUnit: 2.75, sellingPrice: 5.99, averageDailySales: 14 },
  { id: '11', name: 'Coconut Water Bottles', currentStock: 60, costPerUnit: 1.80, sellingPrice: 4.50, averageDailySales: 19 },
  { id: '12', name: 'Protein Powder Tubs', currentStock: 35, costPerUnit: 18.00, sellingPrice: 39.99, averageDailySales: 4 },
  { id: '13', name: 'Kombucha Bottles', currentStock: 48, costPerUnit: 2.50, sellingPrice: 5.99, averageDailySales: 16 },
  { id: '14', name: 'Granola Bags', currentStock: 95, costPerUnit: 3.50, sellingPrice: 7.99, averageDailySales: 9 },
  { id: '15', name: 'Avocado Oil Bottles', currentStock: 42, costPerUnit: 7.50, sellingPrice: 16.99, averageDailySales: 5 },
  { id: '16', name: 'Rice Noodle Packs', currentStock: 110, costPerUnit: 2.25, sellingPrice: 4.99, averageDailySales: 13 },
  { id: '17', name: 'Matcha Powder Tins', currentStock: 18, costPerUnit: 12.00, sellingPrice: 24.99, averageDailySales: 3 },
  { id: '18', name: 'Quinoa Bags', currentStock: 68, costPerUnit: 4.75, sellingPrice: 9.99, averageDailySales: 8 },
  { id: '19', name: 'Chia Seeds Pouches', currentStock: 82, costPerUnit: 5.50, sellingPrice: 11.99, averageDailySales: 6 },
  { id: '20', name: 'Maple Syrup Bottles', currentStock: 30, costPerUnit: 8.00, sellingPrice: 17.99, averageDailySales: 5 },
  { id: '21', name: 'Dried Mango Bags', currentStock: 72, costPerUnit: 3.25, sellingPrice: 7.50, averageDailySales: 10 },
  { id: '22', name: 'Peanut Butter Jars', currentStock: 125, costPerUnit: 4.50, sellingPrice: 9.99, averageDailySales: 17 },
  { id: '23', name: 'Green Tea Sachets', currentStock: 150, costPerUnit: 3.00, sellingPrice: 6.99, averageDailySales: 12 },
  { id: '24', name: 'Cashew Nuts Packs', currentStock: 40, costPerUnit: 6.75, sellingPrice: 14.99, averageDailySales: 7 },
  { id: '25', name: 'Olive Oil Bottles', currentStock: 55, costPerUnit: 9.00, sellingPrice: 19.99, averageDailySales: 6 },
  { id: '26', name: 'Whole Wheat Pasta', currentStock: 88, costPerUnit: 2.50, sellingPrice: 5.49, averageDailySales: 11 },
  { id: '27', name: 'Canned Tuna', currentStock: 135, costPerUnit: 1.75, sellingPrice: 3.99, averageDailySales: 20 },
  { id: '28', name: 'Tomato Sauce Jars', currentStock: 98, costPerUnit: 2.25, sellingPrice: 4.99, averageDailySales: 15 },
  { id: '29', name: 'Balsamic Vinegar', currentStock: 32, costPerUnit: 5.50, sellingPrice: 12.99, averageDailySales: 4 },
  { id: '30', name: 'Sea Salt Grinders', currentStock: 65, costPerUnit: 3.75, sellingPrice: 8.99, averageDailySales: 6 },
  { id: '31', name: 'Black Pepper Mills', currentStock: 58, costPerUnit: 4.00, sellingPrice: 9.49, averageDailySales: 5 },
  { id: '32', name: 'Cinnamon Sticks', currentStock: 45, costPerUnit: 6.25, sellingPrice: 13.99, averageDailySales: 3 },
  { id: '33', name: 'Vanilla Extract Bottles', currentStock: 28, costPerUnit: 10.50, sellingPrice: 22.99, averageDailySales: 4 },
  { id: '34', name: 'Soy Sauce Bottles', currentStock: 92, costPerUnit: 2.75, sellingPrice: 5.99, averageDailySales: 14 },
  { id: '35', name: 'Hot Sauce Bottles', currentStock: 78, costPerUnit: 3.50, sellingPrice: 7.99, averageDailySales: 11 },
  { id: '36', name: 'BBQ Sauce Bottles', currentStock: 64, costPerUnit: 3.25, sellingPrice: 6.99, averageDailySales: 9 },
  { id: '37', name: 'Mustard Jars', currentStock: 85, costPerUnit: 2.50, sellingPrice: 5.49, averageDailySales: 8 },
  { id: '38', name: 'Salsa Jars', currentStock: 52, costPerUnit: 3.75, sellingPrice: 7.99, averageDailySales: 12 },
  { id: '39', name: 'Hummus Containers', currentStock: 38, costPerUnit: 2.25, sellingPrice: 4.99, averageDailySales: 16 },
  { id: '40', name: 'Tortilla Chips Bags', currentStock: 105, costPerUnit: 2.00, sellingPrice: 4.49, averageDailySales: 21 },
  { id: '41', name: 'Popcorn Kernels', currentStock: 115, costPerUnit: 1.50, sellingPrice: 3.49, averageDailySales: 13 },
  { id: '42', name: 'Trail Mix Bags', currentStock: 70, costPerUnit: 4.25, sellingPrice: 8.99, averageDailySales: 10 },
  { id: '43', name: 'Energy Bars', currentStock: 155, costPerUnit: 1.25, sellingPrice: 2.99, averageDailySales: 25 },
  { id: '44', name: 'Protein Bars', currentStock: 130, costPerUnit: 1.75, sellingPrice: 3.99, averageDailySales: 22 },
  { id: '45', name: 'Sparkling Water Cans', currentStock: 180, costPerUnit: 0.75, sellingPrice: 1.99, averageDailySales: 30 },
  { id: '46', name: 'Iced Coffee Bottles', currentStock: 42, costPerUnit: 2.50, sellingPrice: 5.49, averageDailySales: 18 },
  { id: '47', name: 'Lemonade Bottles', currentStock: 55, costPerUnit: 1.75, sellingPrice: 3.99, averageDailySales: 17 },
  { id: '48', name: 'Almond Milk Cartons', currentStock: 65, costPerUnit: 2.25, sellingPrice: 4.99, averageDailySales: 14 },
  { id: '49', name: 'Oat Milk Cartons', currentStock: 48, costPerUnit: 2.50, sellingPrice: 5.49, averageDailySales: 15 },
  { id: '50', name: 'Coconut Milk Cans', currentStock: 88, costPerUnit: 1.50, sellingPrice: 3.49, averageDailySales: 11 },
];

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedProducts = JSON.parse(stored);
        // If stored products are less than 50, reset to default
        if (parsedProducts.length < 50) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
          return defaultProducts;
        }
        return parsedProducts;
      }
      return defaultProducts;
    } catch {
      return defaultProducts;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getProduct = (id: string) => {
    return products.find((p) => p.id === id);
  };

  return (
    <InventoryContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct, getProduct }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
}