'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Edit2, PackagePlus, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const blankItem = { description: '', sku: '', quantity: 1, unitCost: 0, receivedQuantity: 0 };
const blankForm = {
  supplier: '',
  status: 'draft',
  paymentStatus: 'unpaid',
  expectedDelivery: '',
  tax: 0,
  shipping: 0,
  notes: '',
  items: [blankItem],
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(blankForm);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [purchaseRes, supplierRes] = await Promise.all([fetch('/api/purchases'), fetch('/api/suppliers')]);
      const [purchaseData, supplierData] = await Promise.all([purchaseRes.json(), supplierRes.json()]);
      if (purchaseData.success) setPurchases(purchaseData.data);
      if (supplierData.success) setSuppliers(supplierData.data.filter((supplier: any) => supplier.isActive));
    } catch {
      toast.error('Failed to load purchase data');
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0), 0);
    return { subtotal, total: subtotal + Number(form.tax || 0) + Number(form.shipping || 0) };
  }, [form.items, form.tax, form.shipping]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...blankForm, supplier: suppliers[0]?._id || '' });
    setModalOpen(true);
  };

  const openEdit = (purchase: any) => {
    setEditTarget(purchase);
    setForm({
      supplier: purchase.supplier?._id || purchase.supplier || '',
      status: purchase.status || 'draft',
      paymentStatus: purchase.paymentStatus || 'unpaid',
      expectedDelivery: purchase.expectedDelivery ? purchase.expectedDelivery.slice(0, 10) : '',
      tax: purchase.tax || 0,
      shipping: purchase.shipping || 0,
      notes: purchase.notes || '',
      items: purchase.items?.length ? purchase.items.map((item: any) => ({
        description: item.description || '',
        sku: item.sku || '',
        quantity: item.quantity || 1,
        unitCost: item.unitCost || 0,
        receivedQuantity: item.receivedQuantity || 0,
      })) : [blankItem],
    });
    setModalOpen(true);
  };

  const updateItem = (index: number, patch: any) => {
    setForm({
      ...form,
      items: form.items.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, ...patch } : item),
    });
  };

  const removeItem = (index: number) => {
    setForm({ ...form, items: form.items.filter((_item: any, itemIndex: number) => itemIndex !== index) });
  };

  const savePurchase = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.supplier) {
      toast.error('Select supplier first');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/purchases/${editTarget._id}` : '/api/purchases', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: form.items.filter((item: any) => item.description) }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Purchase save failed');
        return;
      }
      toast.success(editTarget ? 'Purchase updated' : 'Purchase created');
      setModalOpen(false);
      fetchAll();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const cancelPurchase = async () => {
    if (!cancelTarget?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/purchases/${cancelTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Purchase order cancelled');
        setCancelTarget(null);
        fetchAll();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Purchase Orders</h1>
          <p className="text-sm text-zinc-500">Create POs, track receiving, delivery dates and payment state.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" />
          New PO
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-4 font-medium">PO</th>
              <th className="px-6 py-4 font-medium">Supplier</th>
              <th className="px-6 py-4 font-medium">Items</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center">Loading purchase orders...</td></tr>
            ) : purchases.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500"><PackagePlus className="mx-auto mb-3 h-8 w-8 opacity-20" />No purchase orders yet.</td></tr>
            ) : purchases.map((purchase) => (
              <tr key={purchase._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4">
                  <p className="font-medium text-zinc-900 dark:text-white">{purchase.poNumber}</p>
                  <p className="text-xs text-zinc-500">{purchase.expectedDelivery ? `Due ${purchase.expectedDelivery.slice(0, 10)}` : 'No due date'}</p>
                </td>
                <td className="px-6 py-4">{purchase.supplier?.name || 'Supplier'}</td>
                <td className="px-6 py-4">{purchase.items?.length || 0}</td>
                <td className="px-6 py-4">₹{Number(purchase.total || 0).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium capitalize text-zinc-700 dark:bg-white/10 dark:text-zinc-200">{purchase.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(purchase)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => setCancelTarget(purchase)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit Purchase Order' : 'New Purchase Order'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={savePurchase} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-4">
                <select required value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.name}</option>)}
                </select>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                  {['draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                  {['unpaid', 'partial', 'paid'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <input type="date" value={form.expectedDelivery} onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>

              <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Line items</h3>
                  <button type="button" onClick={() => setForm({ ...form, items: [...form.items, blankItem] })} className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-200">
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                  </button>
                </div>
                {form.items.map((item: any, index: number) => (
                  <div key={index} className="grid gap-3 md:grid-cols-[2fr_1fr_0.8fr_0.8fr_0.8fr_auto]">
                    <input required placeholder="Description" value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    <input placeholder="SKU" value={item.sku} onChange={(e) => updateItem(index, { sku: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    <input type="number" min="0" value={item.unitCost} onChange={(e) => updateItem(index, { unitCost: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    <input type="number" min="0" value={item.receivedQuantity} onChange={(e) => updateItem(index, { receivedQuantity: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    <button type="button" onClick={() => removeItem(index)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <input type="number" min="0" placeholder="Tax" value={form.tax} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <input type="number" min="0" placeholder="Shipping" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <div className="rounded-lg bg-zinc-50 px-4 py-2 text-sm dark:bg-white/5">Subtotal: ₹{totals.subtotal.toLocaleString('en-IN')}</div>
                <div className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-amber-500 dark:text-black">Total: ₹{totals.total.toLocaleString('en-IN')}</div>
              </div>
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={3} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button>
                <button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save PO'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-950">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Cancel PO?</h2>
                <p className="mt-1 text-sm text-zinc-500">{cancelTarget.poNumber} will be marked as cancelled.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setCancelTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Keep PO</button>
              <button onClick={cancelPurchase} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Cancel PO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
