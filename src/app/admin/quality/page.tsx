'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Edit2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

const defaultChecklist = [
  { label: 'Stitching quality', passed: true, note: '' },
  { label: 'Measurement tolerance', passed: true, note: '' },
  { label: 'Print / embroidery quality', passed: true, note: '' },
  { label: 'Fabric defects', passed: true, note: '' },
  { label: 'Packing readiness', passed: true, note: '' },
];

const blankForm = {
  productionBatch: '',
  product: '',
  inspectorName: '',
  checkedQuantity: 1,
  passedQuantity: 1,
  status: 'passed',
  notes: '',
  checklist: defaultChecklist,
  proofImages: [] as string[],
};

export default function QualityPage() {
  const [checks, setChecks] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [failTarget, setFailTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [proofUpload, setProofUpload] = useState('');
  const [form, setForm] = useState<any>(blankForm);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [qualityRes, batchRes] = await Promise.all([fetch('/api/quality'), fetch('/api/production')]);
      const [qualityData, batchData] = await Promise.all([qualityRes.json(), batchRes.json()]);
      if (qualityData.success) setChecks(qualityData.data);
      if (batchData.success) setBatches(batchData.data.filter((batch: any) => batch.status !== 'cancelled'));
    } catch {
      toast.error('Failed to load quality data');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    const firstBatch = batches[0];
    setEditTarget(null);
    setProofUpload('');
    setForm({
      ...blankForm,
      productionBatch: firstBatch?._id || '',
      product: firstBatch?.product?._id || firstBatch?.product || '',
      checklist: defaultChecklist.map((item) => ({ ...item })),
      proofImages: [],
    });
    setModalOpen(true);
  };

  const openEdit = (check: any) => {
    setEditTarget(check);
    setProofUpload('');
    setForm({
      productionBatch: check.productionBatch?._id || check.productionBatch || '',
      product: check.product?._id || check.product || '',
      inspectorName: check.inspectorName || '',
      checkedQuantity: check.checkedQuantity || 1,
      passedQuantity: check.passedQuantity || 0,
      status: check.status || 'pending',
      notes: check.notes || '',
      checklist: check.checklist?.length ? check.checklist.map((item: any) => ({ label: item.label, passed: item.passed, note: item.note || '' })) : defaultChecklist.map((item) => ({ ...item })),
      proofImages: check.proofImages || [],
    });
    setModalOpen(true);
  };

  const selectBatch = (batchId: string) => {
    const batch = batches.find((item) => item._id === batchId);
    setForm({ ...form, productionBatch: batchId, product: batch?.product?._id || batch?.product || '' });
  };

  const updateChecklist = (index: number, patch: any) => {
    setForm({
      ...form,
      checklist: form.checklist.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, ...patch } : item),
    });
  };

  const addProofImage = (url: string) => {
    setProofUpload(url);
    if (url && !form.proofImages.includes(url)) {
      setForm({ ...form, proofImages: [...form.proofImages, url] });
      setProofUpload('');
    }
  };

  const saveCheck = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.productionBatch || !form.product) {
      toast.error('Select production batch first');
      return;
    }
    const failedQuantity = Math.max(0, Number(form.checkedQuantity || 0) - Number(form.passedQuantity || 0));
    const status = form.status === 'pending' ? 'pending' : failedQuantity > 0 ? form.status || 'rework' : 'passed';
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/quality/${editTarget._id}` : '/api/quality', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          checkedQuantity: Number(form.checkedQuantity || 1),
          passedQuantity: Number(form.passedQuantity || 0),
          failedQuantity,
          status,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'QC save failed');
        return;
      }
      toast.success(editTarget ? 'QC updated' : 'QC created');
      setModalOpen(false);
      fetchAll();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const markFailed = async () => {
    if (!failTarget?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/quality/${failTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('QC marked failed');
        setFailTarget(null);
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Quality Checks</h1>
          <p className="text-sm text-zinc-500">Run QC against production batches with checklist and proof images.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" />
          New QC
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-4 font-medium">QC</th>
              <th className="px-6 py-4 font-medium">Batch</th>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Result</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center">Loading quality checks...</td></tr>
            ) : checks.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500"><CheckCircle2 className="mx-auto mb-3 h-8 w-8 opacity-20" />No quality checks found.</td></tr>
            ) : checks.map((check) => (
              <tr key={check._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-mono text-xs">{check.qcNumber}</td>
                <td className="px-6 py-4">{check.productionBatch?.batchNumber || 'Batch'}</td>
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{check.product?.title || 'Product'}</td>
                <td className="px-6 py-4">{check.passedQuantity || 0}/{check.checkedQuantity || 0} passed</td>
                <td className="px-6 py-4"><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium capitalize text-zinc-700 dark:bg-white/10 dark:text-zinc-200">{check.status}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(check)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => setFailTarget(check)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit QC' : 'New Quality Check'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={saveCheck} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-5">
                <select required value={form.productionBatch} onChange={(e) => selectBatch(e.target.value)} className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <option value="">Select batch</option>
                  {batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.batchNumber} - {batch.product?.title}</option>)}
                </select>
                <input required placeholder="Inspector name" value={form.inspectorName} onChange={(e) => setForm({ ...form, inspectorName: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <input type="number" min="1" value={form.checkedQuantity} onChange={(e) => setForm({ ...form, checkedQuantity: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <input type="number" min="0" value={form.passedQuantity} onChange={(e) => setForm({ ...form, passedQuantity: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                  {['pending', 'passed', 'rework', 'failed'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {form.checklist.map((item: any, index: number) => (
                  <div key={item.label} className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                      <input type="checkbox" checked={item.passed} onChange={(e) => updateChecklist(index, { passed: e.target.checked })} className="accent-amber-500" />
                      {item.label}
                    </label>
                    <input placeholder="Note" value={item.note} onChange={(e) => updateChecklist(index, { note: e.target.value })} className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 dark:border-white/10">
                <ImageUpload label="Add proof image" value={proofUpload} folder="quality" onChange={addProofImage} />
                {form.proofImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
                    {form.proofImages.map((image: string) => (
                      <div key={image} className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10">
                        <img src={image} alt="" className="h-24 w-full object-cover" />
                        <button type="button" onClick={() => setForm({ ...form, proofImages: form.proofImages.filter((item: string) => item !== image) })} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <textarea placeholder="QC notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={3} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button>
                <button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save QC'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {failTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-950">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Mark QC failed?</h2>
                <p className="mt-1 text-sm text-zinc-500">{failTarget.qcNumber} will be marked failed for follow-up.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setFailTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Keep QC</button>
              <button onClick={markFailed} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Mark Failed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
