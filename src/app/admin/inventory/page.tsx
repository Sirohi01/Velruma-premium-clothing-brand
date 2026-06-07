'use client';

import React, { useState, useEffect } from 'react';
import { Package, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Barcode from 'react-barcode';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<{ productId: string, variantId: string, currentStock: number, name: string } | null>(null);
  const [adjForm, setAdjForm] = useState({ quantity: 1, movementType: 'in', reason: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;
    
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedVariant.productId,
          variantId: selectedVariant.variantId,
          quantity: Number(adjForm.quantity),
          movementType: adjForm.movementType,
          reason: adjForm.reason,
          warehouse: 'Main Warehouse'
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Stock adjusted successfully. New stock: ${data.newStock}`);
        setIsModalOpen(false);
        setAdjForm({ quantity: 1, movementType: 'in', reason: '' });
        fetchProducts(); // Refresh to get new stock
      } else {
        toast.error(data.error || 'Adjustment failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.variants?.some((v: any) => v.sku?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Inventory Management
          </h1>
          <p className="text-sm text-zinc-500">Track and adjust stock levels across all variants.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by product title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border-none bg-transparent py-2 pl-10 pr-4 text-sm text-zinc-900 focus:outline-none dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Product & Variant</th>
              <th className="px-6 py-4 font-medium">SKU / Barcode</th>
              <th className="px-6 py-4 font-medium">Current Stock</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading inventory...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  <Package className="mx-auto mb-3 h-8 w-8 opacity-20" />
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.flatMap(product => 
                (product.variants || []).map((variant: any) => (
                  <tr key={`${product._id}-${variant._id}`} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-white">{product.title}</span>
                        <span className="text-xs text-zinc-500">Size: {variant.size} | Color: {variant.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {variant.sku ? (
                        <div className="scale-75 origin-left">
                          <Barcode value={variant.sku} height={30} displayValue={true} fontSize={12} margin={0} background="transparent" />
                        </div>
                      ) : (
                        <span className="font-mono text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        variant.stock > 10 ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                        variant.stock > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {variant.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedVariant({
                            productId: product._id,
                            variantId: variant._id,
                            currentStock: variant.stock,
                            name: `${product.title} (${variant.size} / ${variant.color})`
                          });
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
                      >
                        <Plus className="h-3 w-3" />
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Adjust Stock</h2>
            <p className="text-sm text-zinc-500 mb-4">{selectedVariant.name}</p>
            <form onSubmit={handleAdjustment} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Movement Type</label>
                <select
                  required
                  value={adjForm.movementType}
                  onChange={(e) => setAdjForm({ ...adjForm, movementType: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <option value="in">Stock In (Add)</option>
                  <option value="out">Stock Out (Subtract)</option>
                  <option value="return">Customer Return (Add)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjForm.quantity}
                  onChange={(e) => setAdjForm({ ...adjForm, quantity: Number(e.target.value) })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Reason / Note</label>
                <input
                  type="text"
                  value={adjForm.reason}
                  onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                  placeholder="e.g. Received new shipment"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
