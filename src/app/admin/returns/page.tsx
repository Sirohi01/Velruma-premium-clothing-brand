'use client';

import { useEffect, useState } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '@/components/shared/DataTable';

const emptyForm = { order: '', reason: '', status: 'Requested', notes: '' };

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    const res = await fetch('/api/returns');
    const data = await res.json();
    if (data.success) setReturns(data.data);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditTarget(item);
    setForm({ order: item.order?._id || item.order || '', reason: item.reason || '', status: item.status || 'Requested', notes: item.notes || '' });
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const res = await fetch(editTarget ? `/api/returns/${editTarget._id}` : '/api/returns', {
      method: editTarget ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(editTarget ? 'Return updated' : 'Return created');
      setModalOpen(false);
      fetchReturns();
    } else {
      toast.error(data.error || 'Return save failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Returns</h1>
          <p className="text-sm text-zinc-500">Track return requests, approvals, received items and refunds.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black">
          <Plus className="h-4 w-4" />
          Add Return
        </button>
      </div>

      <DataTable
        data={returns}
        empty="No returns found."
        columns={[
          { key: 'returnNumber', header: 'Return', cell: (row: any) => <span className="font-medium text-white">{row.returnNumber}</span> },
          { key: 'order', header: 'Order', cell: (row: any) => row.order?.orderId || '-' },
          { key: 'reason', header: 'Reason', cell: (row: any) => row.reason },
          { key: 'status', header: 'Status', cell: (row: any) => <button onClick={() => openEdit(row)} className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">{row.status}</button> },
          { key: 'createdAt', header: 'Created', cell: (row: any) => new Date(row.createdAt).toLocaleDateString('en-IN') },
        ]}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{editTarget ? 'Update Return' : 'Add Return'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={save} className="mt-6 grid gap-4">
              <input required placeholder="Order ObjectId" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
              <textarea required placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
                {['Requested', 'Approved', 'Rejected', 'Received', 'Refunded'].map((status) => <option key={status}>{status}</option>)}
              </select>
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm text-zinc-300 hover:bg-white/10">Cancel</button>
                <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black">Save Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {returns.length === 0 && <RotateCcw className="hidden" />}
    </div>
  );
}
