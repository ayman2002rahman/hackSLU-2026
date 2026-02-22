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
  {
    id: '1',
    name: 'Organic Coffee Beans',
    currentStock: 120,
    costPerUnit: 8.50,
    sellingPrice: 15.99,
    averageDailySales: 12,
  },
  {
    id: '2',
    name: 'Artisan Bread Loaves',
    currentStock: 45,
    costPerUnit: 3.20,
    sellingPrice: 6.50,
    averageDailySales: 18,
  },
  {
    id: '3',
    name: 'Natural Honey Jars',
    currentStock: 8,
    costPerUnit: 5.00,
    sellingPrice: 12.00,
    averageDailySales: 3,
  },
  {
    id: '4',
    name: 'Handmade Soap Bars',
    currentStock: 200,
    costPerUnit: 2.50,
    sellingPrice: 6.99,
    averageDailySales: 5,
  },
  {
    id: '5',
    name: 'Fresh Juice Bottles',
    currentStock: 30,
    costPerUnit: 2.00,
    sellingPrice: 5.50,
    averageDailySales: 15,
  },
  {
    id: '6',
    name: 'Vintage T-Shirts',
    currentStock: 75,
    costPerUnit: 8.00,
    sellingPrice: 24.99,
    averageDailySales: 8,
  },
];

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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
