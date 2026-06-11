'use client';

import React, { useState, useEffect } from 'react';
import { Download, Package, Printer, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Barcode from 'react-barcode';
import JsBarcode from 'jsbarcode';

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

  const inventoryRows = filteredProducts.flatMap((product) =>
    (product.variants || []).map((variant: any) => ({
      productId: product._id,
      variantId: variant._id,
      title: product.title,
      size: variant.size || '-',
      color: variant.color || '-',
      sku: variant.sku || variant.barcode || '',
      barcode: variant.barcode || variant.sku || '',
      stock: Number(variant.stock || 0),
    }))
  );

  const createBarcodeSvg = (value: string) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, value, {
      format: 'CODE128',
      height: 42,
      width: 1.6,
      fontSize: 12,
      margin: 4,
      displayValue: true,
      background: '#ffffff',
      lineColor: '#111111',
    });
    return new XMLSerializer().serializeToString(svg);
  };

  const printLabels = (rows = inventoryRows) => {
    const printableRows = rows.filter((row) => row.barcode);
    if (!printableRows.length) {
      toast.error('No SKU/barcode available to print');
      return;
    }

    const labels = printableRows.map((row) => {
      const barcodeSvg = createBarcodeSvg(row.barcode);
      return `
        <section class="label">
          <div class="brand">VELRUMA</div>
          <div class="title">${escapeHtml(row.title)}</div>
          <div class="meta">Size: ${escapeHtml(row.size)} | Color: ${escapeHtml(row.color)}</div>
          <div class="barcode">${barcodeSvg}</div>
          <div class="sku">SKU: ${escapeHtml(row.sku)}</div>
        </section>
      `;
    }).join('');

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      toast.error('Popup blocked. Please allow popups to print labels.');
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>VELRUMA SKU Labels</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 16px; font-family: Arial, sans-serif; color: #111; }
            .sheet { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .label { min-height: 132px; border: 1px solid #d4d4d8; border-radius: 8px; padding: 10px; break-inside: avoid; }
            .brand { font-size: 11px; font-weight: 800; letter-spacing: 1.4px; }
            .title { margin-top: 5px; font-size: 12px; font-weight: 700; line-height: 1.25; height: 30px; overflow: hidden; }
            .meta, .sku { font-size: 10px; color: #52525b; }
            .barcode { margin-top: 4px; display: flex; justify-content: center; }
            .barcode svg { max-width: 100%; height: 54px; }
            @media print {
              body { padding: 8mm; }
              .sheet { gap: 6mm; }
              .label { border-color: #999; }
            }
          </style>
        </head>
        <body>
          <main class="sheet">${labels}</main>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadCsv = () => {
    const rows = inventoryRows.filter((row) => row.sku || row.barcode);
    if (!rows.length) {
      toast.error('No SKU/barcode available to download');
      return;
    }
    const csv = [
      ['Product', 'Size', 'Color', 'SKU', 'Barcode', 'Stock'],
      ...rows.map((row) => [row.title, row.size, row.color, row.sku, row.barcode, String(row.stock)]),
    ].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    downloadFile(csv, `velruma-sku-barcodes-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
    toast.success('SKU barcode CSV downloaded');
  };

  const downloadBarcodeSvg = (row: { title: string; size: string; color: string; sku: string; barcode: string }) => {
    if (!row.barcode) {
      toast.error('No barcode available');
      return;
    }
    const svg = createBarcodeSvg(row.barcode);
    const filename = `${slugify(row.sku || row.title)}-barcode.svg`;
    downloadFile(svg, filename, 'image/svg+xml;charset=utf-8');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'velruma';

  const escapeHtml = (value: string) =>
    String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

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

      <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:flex-row sm:items-center">
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
        <div className="flex gap-2">
          <button
            onClick={() => printLabels()}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black"
          >
            <Printer className="h-4 w-4" />
            Print Labels
          </button>
          <button
            onClick={downloadCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
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
              inventoryRows.map((row) => (
                  <tr key={`${row.productId}-${row.variantId}`} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-white">{row.title}</span>
                        <span className="text-xs text-zinc-500">Size: {row.size} | Color: {row.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {row.barcode ? (
                        <div className="scale-75 origin-left">
                          <Barcode value={row.barcode} height={30} displayValue={true} fontSize={12} margin={0} background="transparent" />
                        </div>
                      ) : (
                        <span className="font-mono text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${row.stock > 10 ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                          row.stock > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                        {row.stock} is left
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => printLabels([row])}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                        >
                          <Printer className="h-3 w-3" />
                          Print
                        </button>
                        <button
                          onClick={() => downloadBarcodeSvg(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                        >
                          <Download className="h-3 w-3" />
                          SVG
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVariant({
                              productId: row.productId,
                              variantId: row.variantId,
                              currentStock: row.stock,
                              name: `${row.title} (${row.size} / ${row.color})`
                            });
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
                        >
                          <Plus className="h-3 w-3" />
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
