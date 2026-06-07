'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Edit2, Plus, Ticket, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const blankForm = {
  code: '',
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderValue: 0,
  maxDiscount: 0,
  usageLimit: 0,
  validFrom: '',
  validUntil: '',
  customerSegment: 'all',
  isActive: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(blankForm);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (data.success) setCoupons(data.data);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(blankForm);
    setModalOpen(true);
  };

  const openEdit = (coupon: any) => {
    setEditTarget(coupon);
    setForm({
      code: coupon.code || '',
      title: coupon.title || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || 0,
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 10) : '',
      validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 10) : '',
      customerSegment: coupon.customerSegment || 'all',
      isActive: coupon.isActive ?? true,
    });
    setModalOpen(true);
  };

  const saveCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/coupons/${editTarget._id}` : '/api/coupons', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Coupon save failed');
        return;
      }
      toast.success(editTarget ? 'Coupon updated' : 'Coupon created');
      setModalOpen(false);
      fetchCoupons();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const deactivateCoupon = async () => {
    if (!deleteTarget?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/coupons/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Coupon deactivated');
        setDeleteTarget(null);
        fetchCoupons();
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Coupons</h1>
          <p className="text-sm text-zinc-500">Create promotional coupon codes and customer segment offers.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black"><Plus className="h-4 w-4" />Add Coupon</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr><th className="px-6 py-4 font-medium">Code</th><th className="px-6 py-4 font-medium">Offer</th><th className="px-6 py-4 font-medium">Rules</th><th className="px-6 py-4 font-medium">Usage</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 text-right font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center">Loading coupons...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500"><Ticket className="mx-auto mb-3 h-8 w-8 opacity-20" />No coupons found.</td></tr>
            ) : coupons.map((coupon) => (
              <tr key={coupon._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4"><p className="font-mono font-semibold text-zinc-900 dark:text-white">{coupon.code}</p><p className="text-xs text-zinc-500">{coupon.title}</p></td>
                <td className="px-6 py-4">{coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}</td>
                <td className="px-6 py-4 text-xs">Min ₹{coupon.minOrderValue || 0}<br />Segment: {coupon.customerSegment}</td>
                <td className="px-6 py-4">{coupon.usedCount || 0}/{coupon.usageLimit || '∞'}</td>
                <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-white/10'}`}>{coupon.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-6 py-4 text-right"><button onClick={() => openEdit(coupon)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button><button onClick={() => setDeleteTarget(coupon)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit Coupon' : 'Add Coupon'}</h2><button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button></div>
            <form onSubmit={saveCoupon} className="mt-6 grid gap-4 md:grid-cols-2">
              <input required placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm uppercase dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select>
              <input type="number" min="0" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="number" min="0" placeholder="Min order value" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="number" min="0" placeholder="Max discount" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="number" min="0" placeholder="Usage limit" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <select value={form.customerSegment} onChange={(e) => setForm({ ...form, customerSegment: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['all', 'new', 'returning', 'vip'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={3} />
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
              <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button><button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save Coupon'}</button></div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-950"><div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10"><AlertTriangle className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Deactivate coupon?</h2><p className="mt-1 text-sm text-zinc-500">{deleteTarget.code} will stop applying at checkout.</p></div></div><div className="mt-5 flex justify-end gap-3"><button onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Keep Active</button><button onClick={deactivateCoupon} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Deactivate</button></div></div></div>
      )}
    </div>
  );
}
