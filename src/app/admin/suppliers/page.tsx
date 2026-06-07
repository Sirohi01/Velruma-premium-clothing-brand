'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Edit2, Plus, Trash2, Truck, X } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = {
  name: '',
  type: 'manufacturer',
  contactName: '',
  phone: '',
  email: '',
  gstNumber: '',
  city: '',
  state: '',
  paymentTerms: '',
  leadTimeDays: 7,
  rating: 3,
  notes: '',
  isActive: true,
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.success) setSuppliers(data.data);
    } catch {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (supplier: any) => {
    const contact = supplier.contacts?.[0] || {};
    setEditTarget(supplier);
    setForm({
      name: supplier.name || '',
      type: supplier.type || 'manufacturer',
      contactName: contact.name || '',
      phone: contact.phone || '',
      email: contact.email || '',
      gstNumber: supplier.gstNumber || '',
      city: supplier.address?.city || '',
      state: supplier.address?.state || '',
      paymentTerms: supplier.paymentTerms || '',
      leadTimeDays: supplier.leadTimeDays || 7,
      rating: supplier.rating || 3,
      notes: supplier.notes || '',
      isActive: supplier.isActive ?? true,
    });
    setModalOpen(true);
  };

  const payload = () => ({
    name: form.name,
    type: form.type,
    gstNumber: form.gstNumber,
    paymentTerms: form.paymentTerms,
    leadTimeDays: Number(form.leadTimeDays || 0),
    rating: Number(form.rating || 3),
    notes: form.notes,
    isActive: form.isActive,
    contacts: [{ name: form.contactName || 'Primary', phone: form.phone || 'N/A', email: form.email }],
    address: { city: form.city, state: form.state, country: 'India' },
  });

  const saveSupplier = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/suppliers/${editTarget._id}` : '/api/suppliers', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Supplier save failed');
        return;
      }
      toast.success(editTarget ? 'Supplier updated' : 'Supplier added');
      setModalOpen(false);
      fetchSuppliers();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const deactivateSupplier = async () => {
    if (!deleteTarget?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/suppliers/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Supplier deactivated');
        setDeleteTarget(null);
        fetchSuppliers();
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Suppliers
          </h1>
          <p className="text-sm text-zinc-500">Manage vendors, contacts, lead time and payment terms.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-4 font-medium">Supplier</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Lead</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center">Loading suppliers...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500"><Truck className="mx-auto mb-3 h-8 w-8 opacity-20" />No suppliers found.</td></tr>
            ) : suppliers.map((supplier) => (
              <tr key={supplier._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4">
                  <p className="font-medium text-zinc-900 dark:text-white">{supplier.name}</p>
                  <p className="font-mono text-xs text-zinc-500">{supplier.code}</p>
                </td>
                <td className="px-6 py-4 capitalize">{supplier.type}</td>
                <td className="px-6 py-4">
                  <p>{supplier.contacts?.[0]?.name || 'Primary'}</p>
                  <p className="text-xs text-zinc-500">{supplier.contacts?.[0]?.phone}</p>
                </td>
                <td className="px-6 py-4">{supplier.leadTimeDays || 0} days</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${supplier.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-white/10'}`}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(supplier)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(supplier)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={saveSupplier} className="mt-6 grid gap-4 md:grid-cols-2">
              <input required placeholder="Supplier name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                {['manufacturer', 'fabric', 'trim', 'printing', 'packaging', 'other'].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <input placeholder="Contact person" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="GST number" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="Payment terms" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="number" placeholder="Lead days" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={3} />
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active supplier</label>
              <div className="flex justify-end gap-3 md:col-span-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button>
                <button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-950">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Deactivate supplier?</h2>
                <p className="mt-1 text-sm text-zinc-500">{deleteTarget.name} will stay in old records but stop appearing as active.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Keep Active</button>
              <button onClick={deactivateSupplier} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
