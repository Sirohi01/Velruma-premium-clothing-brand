'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Package, Search, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [archiveTarget, setArchiveTarget] = useState<any | null>(null);
  const [archiving, setArchiving] = useState(false);

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
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!archiveTarget?._id) return;
    setArchiving(true);
    try {
      const res = await fetch(`/api/products/${archiveTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Product archived');
        setArchiveTarget(null);
        fetchProducts();
      } else {
        toast.error(data.error || 'Failed to archive');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setArchiving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.variants?.some((v: any) => v.sku?.toLowerCase().includes(search.toLowerCase()))
  );

  const calculateFinalPrice = (product: any) => {
    const sellingBeforeDiscount = Number(product.salePrice || product.basePrice || 0);
    const discountType = product.discountType || 'none';
    const discountValue = Number(product.discountValue || 0);
    const extraDiscount = discountType === 'percentage'
      ? Math.round((sellingBeforeDiscount * discountValue) / 100)
      : discountType === 'fixed'
        ? discountValue
        : 0;
    return Math.max(0, sellingBeforeDiscount - extraDiscount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Products
          </h1>
          <p className="text-sm text-zinc-500">Manage your product catalog, pricing, and variants.</p>
        </div>
        <Link
          href="/admin/products/create"
          prefetch={false}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border-none bg-transparent py-2 pl-10 pr-4 text-sm text-zinc-900 focus:outline-none dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price (Sale / MRP)</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading products...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  <Package className="mx-auto mb-3 h-8 w-8 opacity-20" />
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{product.title}</p>
                        <p className="text-xs text-zinc-500">{product.variants?.length || 0} variants</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900 dark:text-white">
                        ₹{calculateFinalPrice(product).toLocaleString()}
                      </span>
                      {calculateFinalPrice(product) < (product.basePrice || 0) && (
                        <span className="text-xs text-zinc-500 line-through">
                          ₹{product.basePrice?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      product.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                      product.status === 'draft' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                    }`}>
                      {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product._id}`} prefetch={false} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white">
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => setArchiveTarget(product)}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/10 bg-white shadow-2xl dark:bg-zinc-950">
            <div className="flex items-start justify-between border-b border-zinc-100 p-5 dark:border-white/10">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Archive product?</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{archiveTarget.title}</span> will be hidden from active catalog lists.
                  </p>
                </div>
              </div>
              <button onClick={() => setArchiveTarget(null)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-zinc-50 p-5 dark:bg-zinc-900/70">
              <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{archiveTarget.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{archiveTarget.variants?.length || 0} variants</p>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setArchiveTarget(null)} disabled={archiving} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-white/10">
                  Keep Product
                </button>
                <button type="button" onClick={handleDelete} disabled={archiving} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-60">
                  {archiving ? 'Archiving...' : 'Archive Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
