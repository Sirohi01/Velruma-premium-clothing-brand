'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Edit2, Factory, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const stageOrder = ['cutting', 'stitching', 'printing', 'washing', 'qc', 'packing'];
const blankForm = {
  product: '',
  supplier: '',
  purchaseOrder: '',
  plannedQuantity: 1,
  completedQuantity: 0,
  rejectedQuantity: 0,
  currentStage: 'cutting',
  status: 'in_progress',
  startDate: '',
  targetDate: '',
  notes: '',
  stages: stageOrder.map((stage, index) => ({ stage, status: index === 0 ? 'in_progress' : 'pending', quantityDone: 0, notes: '' })),
};

export default function ProductionPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
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
      const [batchRes, productRes, supplierRes, purchaseRes] = await Promise.all([
        fetch('/api/production'),
        fetch('/api/products'),
        fetch('/api/suppliers'),
        fetch('/api/purchases'),
      ]);
      const [batchData, productData, supplierData, purchaseData] = await Promise.all([
        batchRes.json(),
        productRes.json(),
        supplierRes.json(),
        purchaseRes.json(),
      ]);
      if (batchData.success) setBatches(batchData.data);
      if (productData.success) setProducts(productData.data);
      if (supplierData.success) setSuppliers(supplierData.data.filter((supplier: any) => supplier.isActive));
      if (purchaseData.success) setPurchases(purchaseData.data.filter((purchase: any) => purchase.status !== 'cancelled'));
    } catch {
      toast.error('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...blankForm, product: products[0]?._id || '', supplier: suppliers[0]?._id || '' });
    setModalOpen(true);
  };

  const openEdit = (batch: any) => {
    setEditTarget(batch);
    setForm({
      product: batch.product?._id || batch.product || '',
      supplier: batch.supplier?._id || batch.supplier || '',
      purchaseOrder: batch.purchaseOrder?._id || batch.purchaseOrder || '',
      plannedQuantity: batch.plannedQuantity || 1,
      completedQuantity: batch.completedQuantity || 0,
      rejectedQuantity: batch.rejectedQuantity || 0,
      currentStage: batch.currentStage || 'cutting',
      status: batch.status || 'in_progress',
      startDate: batch.startDate ? batch.startDate.slice(0, 10) : '',
      targetDate: batch.targetDate ? batch.targetDate.slice(0, 10) : '',
      notes: batch.notes || '',
      stages: batch.stages?.length ? batch.stages.map((stage: any) => ({
        stage: stage.stage,
        status: stage.status,
        quantityDone: stage.quantityDone || 0,
        notes: stage.notes || '',
        completedAt: stage.completedAt,
      })) : blankForm.stages,
    });
    setModalOpen(true);
  };

  const updateStage = (index: number, patch: any) => {
    setForm({
      ...form,
      stages: form.stages.map((stage: any, stageIndex: number) => stageIndex === index ? { ...stage, ...patch } : stage),
    });
  };

  const saveBatch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.product) {
      toast.error('Select product first');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/production/${editTarget._id}` : '/api/production', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          supplier: form.supplier || undefined,
          purchaseOrder: form.purchaseOrder || undefined,
          plannedQuantity: Number(form.plannedQuantity || 1),
          completedQuantity: Number(form.completedQuantity || 0),
          rejectedQuantity: Number(form.rejectedQuantity || 0),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Batch save failed');
        return;
      }
      toast.success(editTarget ? 'Batch updated' : 'Batch created');
      setModalOpen(false);
      fetchAll();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const cancelBatch = async () => {
    if (!cancelTarget?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/production/${cancelTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Batch cancelled');
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Production</h1>
          <p className="text-sm text-zinc-500">Track product batches from cutting to packing.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" />
          New Batch
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-4 font-medium">Batch</th>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Qty</th>
              <th className="px-6 py-4 font-medium">Stage</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center">Loading production...</td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500"><Factory className="mx-auto mb-3 h-8 w-8 opacity-20" />No batches found.</td></tr>
            ) : batches.map((batch) => (
              <tr key={batch._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-mono text-xs">{batch.batchNumber}</td>
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{batch.product?.title || 'Product'}</td>
                <td className="px-6 py-4">{batch.completedQuantity || 0}/{batch.plannedQuantity || 0}</td>
                <td className="px-6 py-4 capitalize">{batch.currentStage}</td>
                <td className="px-6 py-4"><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium capitalize text-zinc-700 dark:bg-white/10 dark:text-zinc-200">{batch.status}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(batch)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => setCancelTarget(batch)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit Batch' : 'New Production Batch'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={saveBatch} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-4">
                <select required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <option value="">Select product</option>
                  {products.map((product) => <option key={product._id} value={product._id}>{product.title}</option>)}
                </select>
                <select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <option value="">No supplier</option>
                  {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.name}</option>)}
                </select>
                <select value={form.purchaseOrder} onChange={(e) => setForm({ ...form, purchaseOrder: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <option value="">No PO</option>
                  {purchases.map((purchase) => <option key={purchase._id} value={purchase._id}>{purchase.poNumber}</option>)}
                </select>
                <input type="number" min="1" value={form.plannedQuantity} onChange={(e) => setForm({ ...form, plannedQuantity: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <select value={form.currentStage} onChange={(e) => setForm({ ...form, currentStage: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm capitalize dark:border-white/10 dark:bg-white/5 dark:text-white">
                  {stageOrder.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                </select>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                  {['planned', 'in_progress', 'paused', 'completed', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <input type="number" min="0" placeholder="Completed" value={form.completedQuantity} onChange={(e) => setForm({ ...form, completedQuantity: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <input type="number" min="0" placeholder="Rejected" value={form.rejectedQuantity} onChange={(e) => setForm({ ...form, rejectedQuantity: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {form.stages.map((stage: any, index: number) => (
                  <div key={stage.stage} className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
                    <p className="text-sm font-semibold capitalize text-zinc-900 dark:text-white">{stage.stage}</p>
                    <div className="mt-3 grid gap-2">
                      <select value={stage.status} onChange={(e) => updateStage(index, { status: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                        {['pending', 'in_progress', 'completed'].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <input type="number" min="0" value={stage.quantityDone} onChange={(e) => updateStage(index, { quantityDone: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                      <input placeholder="Stage notes" value={stage.notes} onChange={(e) => updateStage(index, { notes: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    </div>
                  </div>
                ))}
              </div>
              <textarea placeholder="Batch notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={3} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button>
                <button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save Batch'}</button>
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
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Cancel batch?</h2>
                <p className="mt-1 text-sm text-zinc-500">{cancelTarget.batchNumber} will be marked cancelled.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setCancelTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Keep Batch</button>
              <button onClick={cancelBatch} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Cancel Batch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
