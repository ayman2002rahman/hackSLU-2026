import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types/inventory';
import { supabase } from '../lib/supabase';
import type { ProductRow } from '../lib/supabase';

function rowToProduct(row: ProductRow & { id?: number }, index: number): Product {
  return {
    id: row.id != null ? String(row.id) : `name-${index}-${row.product_name}`,
    name: row.product_name,
    currentStock: Number(row.current_stock),
    costPerUnit: Number(row.cost),
    sellingPrice: Number(row.selling_price),
    averageDailySales: Number(row.avg_daily_sales),
  };
}

function productToRow(p: Partial<Product>): Partial<ProductRow> {
  const row: Partial<ProductRow> = {};
  if (p.name !== undefined) row.product_name = p.name;
  if (p.currentStock !== undefined) row.current_stock = p.currentStock;
  if (p.costPerUnit !== undefined) row.cost = p.costPerUnit;
  if (p.sellingPrice !== undefined) row.selling_price = p.sellingPrice;
  if (p.averageDailySales !== undefined) row.avg_daily_sales = p.averageDailySales;
  return row;
}

interface InventoryContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('product_name');
      if (fetchError) throw fetchError;
      const list = (data ?? []) as (ProductRow & { id?: number })[];
      setProducts(list.map((row, i) => rowToProduct(row, i)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(
    async (product: Omit<Product, 'id'>) => {
      if (!supabase) return;
      const row: ProductRow = {
        product_name: product.name,
        current_stock: product.currentStock,
        cost: product.costPerUnit,
        selling_price: product.sellingPrice,
        avg_daily_sales: product.averageDailySales,
      };
      const { data, error: insertError } = await supabase
        .from('products')
        .insert(row)
        .select()
        .maybeSingle();
      if (insertError) throw insertError;
      const inserted = (data ?? row) as ProductRow & { id?: number };
      setProducts((prev) => [...prev, rowToProduct(inserted, prev.length)]);
    },
    []
  );

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    if (!supabase) return;
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const row = productToRow(updates);
    const numericId = id.match(/^\d+$/) ? Number(id) : null;
    if (numericId != null) {
      const { error: updateError } = await supabase.from('products').update(row).eq('id', numericId);
      if (updateError) throw updateError;
    } else {
      const { error: updateError } = await supabase
        .from('products')
        .update(row)
        .eq('product_name', product.name);
      if (updateError) throw updateError;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, [products]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!supabase) return;
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const numericId = id.match(/^\d+$/) ? Number(id) : null;
    if (numericId != null) {
      const { error: deleteError } = await supabase.from('products').delete().eq('id', numericId);
      if (deleteError) throw deleteError;
    } else {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('product_name', product.name);
      if (deleteError) throw deleteError;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, [products]);

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  return (
    <InventoryContext.Provider
      value={{
        products,
        loading,
        error,
        refetch: fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
      }}
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
