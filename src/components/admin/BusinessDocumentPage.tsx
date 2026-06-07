'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '@/components/shared/DataTable';

const emptyForm = { customerName: '', customerEmail: '', reference: '', subtotal: 0, tax: 0, discount: 0, status: 'Draft', notes: '' };

export default function BusinessDocumentPage({ title, description, endpoint }: { title: string; description: string; endpoint: string }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
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
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`${title} created`);
      setModalOpen(false);
      setForm(emptyForm);
      fetchDocuments();
    } else {
      toast.error(data.error || 'Document save failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black">
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      <DataTable
        data={documents}
        empty="No documents found."
        columns={[
          { key: 'documentNumber', header: 'Number', cell: (row: any) => <span className="font-medium text-white">{row.documentNumber}</span> },
          { key: 'customerName', header: 'Customer', cell: (row: any) => row.customerName },
          { key: 'total', header: 'Total', cell: (row: any) => `Rs.${Number(row.total || 0).toLocaleString('en-IN')}` },
          { key: 'status', header: 'Status', cell: (row: any) => row.status },
          { key: 'issuedAt', header: 'Issued', cell: (row: any) => new Date(row.issuedAt).toLocaleDateString('en-IN') },
        ]}
      />
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-950 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add {title}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={save} className="mt-6 grid gap-4 md:grid-cols-2">
              <Input required label="Customer Name" value={form.customerName} onChange={(value) => setForm({ ...form, customerName: value })} />
              <Input label="Customer Email" value={form.customerEmail} onChange={(value) => setForm({ ...form, customerEmail: value })} />
              <Input label="Reference" value={form.reference} onChange={(value) => setForm({ ...form, reference: value })} />
              <Input label="Subtotal" type="number" value={String(form.subtotal)} onChange={(value) => setForm({ ...form, subtotal: Number(value) })} />
              <Input label="Tax" type="number" value={String(form.tax)} onChange={(value) => setForm({ ...form, tax: Number(value) })} />
              <Input label="Discount" type="number" value={String(form.discount)} onChange={(value) => setForm({ ...form, discount: Number(value) })} />
              <textarea placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-2" />
              <div className="flex justify-end gap-3 md:col-span-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm text-zinc-300 hover:bg-white/10">Cancel</button>
                <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black">Save</button>
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
      <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">{label}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
    </label>
  );
}
