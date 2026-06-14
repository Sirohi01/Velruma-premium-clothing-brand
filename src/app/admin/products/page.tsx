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
  const [variantTarget, setVariantTarget] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [archiving, setArchiving] = useState(false);
  const pageSize = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        if (data.pagination) setPagination(data.pagination);
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border-none bg-transparent py-2 pl-10 pr-4 text-sm text-zinc-900 focus:outline-none dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <>
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
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  <Package className="mx-auto mb-3 h-8 w-8 opacity-20" />
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  onClick={() => setVariantTarget(product)}
                  className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                >
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
                      <Link href={`/admin/products/${product._id}`} prefetch={false} onClick={(event) => event.stopPropagation()} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white">
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={(event) => {
                          event.stopPropagation();
                          setArchiveTarget(product);
                        }}
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

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page {pagination.page} of {pagination.totalPages} - {pagination.total.toLocaleString('en-IN')} products
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={pagination.page === 1}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 font-medium disabled:opacity-50 dark:border-white/10"
          >
            Previous
          </button>
          <span className="px-2 font-semibold text-zinc-900 dark:text-white">{pagination.page} / {pagination.totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
            disabled={pagination.page === pagination.totalPages}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 font-medium disabled:opacity-50 dark:border-white/10"
          >
            Next
          </button>
        </div>
      </div>
      </>

      {variantTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-amber-500/10 bg-white shadow-2xl dark:bg-zinc-950">
            <div className="flex items-start justify-between border-b border-zinc-100 p-5 dark:border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{variantTarget.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{variantTarget.variants?.length || 0} variants with SKU, stock, price add-on and barcode.</p>
              </div>
              <button onClick={() => setVariantTarget(null)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10">
                <table className="w-full min-w-[760px] text-left text-sm text-zinc-600 dark:text-zinc-400">
                  <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-white/5">
                    <tr>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Color</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Barcode</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Extra Price</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                    {(variantTarget.variants || []).map((variant: any, index: number) => (
                      <tr key={variant._id || index}>
                        <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">{variant.size || '-'}</td>
                        <td className="px-4 py-3">{variant.color || '-'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{variant.sku || '-'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{variant.barcode || '-'}</td>
                        <td className="px-4 py-3">{variant.stock ?? 0}</td>
                        <td className="px-4 py-3">Rs.{Number(variant.extraPrice || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">{variant.isActive === false ? 'Inactive' : 'Active'}</td>
                      </tr>
                    ))}
                    {(!variantTarget.variants || variantTarget.variants.length === 0) && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">No variants found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 flex justify-end">
                <Link href={`/admin/products/${variantTarget._id}`} prefetch={false} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400">
                  Edit Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
