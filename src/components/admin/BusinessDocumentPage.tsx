'use client';

import { useEffect, useState } from 'react';
import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '@/components/shared/DataTable';

const emptyForm = { customerName: '', customerEmail: '', reference: '', subtotal: 0, tax: 0, discount: 0, status: 'Draft', notes: '' };

export default function BusinessDocumentPage({ title, description, endpoint }: { title: string; description: string; endpoint: string }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (data.success) setDocuments(data.data);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const res = await fetch(editTarget ? `${endpoint}/${editTarget._id}` : endpoint, {
      method: editTarget ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(editTarget ? `${title} updated` : `${title} created`);
      setModalOpen(false);
      setEditTarget(null);
      setForm(emptyForm);
      fetchDocuments();
    } else {
      toast.error(data.error || 'Document save failed');
    }
    setSaving(false);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (document: any) => {
    setEditTarget(document);
    setForm({
      customerName: document.customerName || '',
      customerEmail: document.customerEmail || '',
      reference: document.reference || '',
      subtotal: Number(document.subtotal || 0),
      tax: Number(document.tax || 0),
      discount: Number(document.discount || 0),
      status: document.status || 'Draft',
      notes: document.notes || '',
    });
    setModalOpen(true);
  };

  const deleteDocument = async (document: any) => {
    const res = await fetch(`${endpoint}/${document._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast.success(`${title} removed`);
      fetchDocuments();
    } else {
      toast.error(data.error || 'Action failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">{title}</h1>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      <DataTable
        data={documents}
        empty="No documents found."
        columns={[
          { key: 'documentNumber', header: 'Number', cell: (row: any) => <span className="font-medium text-zinc-950 dark:text-white">{row.documentNumber}</span> },
          { key: 'customerName', header: 'Customer', cell: (row: any) => row.customerName },
          { key: 'total', header: 'Total', cell: (row: any) => `Rs.${Number(row.total || 0).toLocaleString('en-IN')}` },
          { key: 'status', header: 'Status', cell: (row: any) => <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600">{row.status}</span> },
          { key: 'issuedAt', header: 'Issued', cell: (row: any) => new Date(row.issuedAt).toLocaleDateString('en-IN') },
          {
            key: 'actions',
            header: 'Actions',
            className: 'px-5 py-3 text-right',
            cell: (row: any) => (
              <div className="flex justify-end gap-1">
                <button onClick={() => openEdit(row)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => deleteDocument(row)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">{editTarget ? 'Edit' : 'Add'} {title}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={save} className="mt-5 grid gap-3 md:grid-cols-2">
              <Input required label="Customer Name" value={form.customerName} onChange={(value) => setForm({ ...form, customerName: value })} />
              <Input label="Customer Email" value={form.customerEmail} onChange={(value) => setForm({ ...form, customerEmail: value })} />
              <Input label="Reference" value={form.reference} onChange={(value) => setForm({ ...form, reference: value })} />
              <Input label="Subtotal" type="number" value={String(form.subtotal)} onChange={(value) => setForm({ ...form, subtotal: Number(value) })} />
              <Input label="Tax" type="number" value={String(form.tax)} onChange={(value) => setForm({ ...form, tax: Number(value) })} />
              <Input label="Discount" type="number" value={String(form.discount)} onChange={(value) => setForm({ ...form, discount: Number(value) })} />
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Status</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-white">
                  {['Draft', 'Sent', 'Accepted', 'Paid', 'Cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <textarea placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 md:col-span-2 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <div className="flex justify-end gap-3 md:col-span-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm text-zinc-300 hover:bg-white/10">Cancel</button>
                <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-white" />
    </label>
  );
}
