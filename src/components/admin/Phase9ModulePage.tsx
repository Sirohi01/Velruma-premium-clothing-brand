'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '@/components/shared/DataTable';

export type Phase9Field = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'json';
  options?: string[];
  required?: boolean;
};

export type Phase9Column = {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'date' | 'currency' | 'boolean';
};

export default function Phase9ModulePage({
  title,
  description,
  endpoint,
  fields,
  columns,
  defaults = {},
}: {
  title: string;
  description: string;
  endpoint: string;
  fields: Phase9Field[];
  columns: Phase9Column[];
  defaults?: Record<string, any>;
}) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>(defaults);

  const emptyForm = useMemo(() => {
    const next: Record<string, any> = { ...defaults };
    for (const field of fields) {
      if (next[field.key] !== undefined) continue;
      next[field.key] = field.type === 'checkbox' ? true : field.type === 'number' ? 0 : '';
    }
    return next;
  }, [defaults, fields]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) setRecords(data.data);
      else toast.error(data.error || `Failed to load ${title}`);
    } catch {
      toast.error(`Failed to load ${title}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditTarget(record);
    const next = { ...emptyForm };
    for (const field of fields) next[field.key] = record[field.key] ?? next[field.key];
    setForm(next);
    setModalOpen(true);
  };

  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      for (const field of fields) {
        if (field.type === 'number') payload[field.key] = Number(payload[field.key] || 0);
      }
      const res = await fetch(editTarget ? `${endpoint}/${editTarget._id}` : endpoint, {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Save failed');
        return;
      }
      toast.success(editTarget ? `${title} updated` : `${title} created`);
      setModalOpen(false);
      fetchRecords();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (record: any) => {
    if (!confirm(`Deactivate ${record.title || record.name || 'record'}?`)) return;
    try {
      const res = await fetch(`${endpoint}/${record._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Record deactivated');
        fetchRecords();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const renderValue = (record: any, column: Phase9Column) => {
    const value = record[column.key];
    if (column.type === 'date') return value ? new Date(value).toLocaleDateString('en-IN') : '-';
    if (column.type === 'currency') return `Rs.${Number(value || 0).toLocaleString('en-IN')}`;
    if (column.type === 'boolean') return value ? 'Yes' : 'No';
    if (column.type === 'status') {
      return (
        <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium capitalize text-amber-500">
          {String(value ?? 'active').replaceAll('_', ' ')}
        </span>
      );
    }
    return Array.isArray(value) ? value.join(', ') : value || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            {title}
          </h1>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <DataTable
        data={records}
        empty={loading ? 'Loading records...' : 'No records found.'}
        columns={[
          ...columns.map((column) => ({
            key: column.key,
            header: column.label,
            cell: (record: any) => renderValue(record, column),
          })),
          {
            key: 'actions',
            header: 'Actions',
            className: 'px-5 py-3 text-right',
            cell: (record: any) => (
              <div className="flex justify-end gap-1">
                <button onClick={() => openEdit(record)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => deactivate(record)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{editTarget ? `Edit ${title}` : `Add ${title}`}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={saveRecord} className="mt-6 grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className={field.type === 'textarea' || field.type === 'json' ? 'md:col-span-2' : ''}>
                  <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">{field.label}</span>
                  {field.type === 'json' ? (
                    <pre className="w-full max-h-64 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-xs dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                      {JSON.stringify(form[field.key] || {}, null, 2)}
                    </pre>
                  ) : field.type === 'textarea' ? (
                    <textarea required={field.required} value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} rows={4} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  ) : field.type === 'select' ? (
                    <select value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                      {(field.options || []).map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <input type="checkbox" checked={Boolean(form[field.key])} onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })} className="h-4 w-4" />
                  ) : (
                    <input type={field.type || 'text'} required={field.required} value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  )}
                </label>
              ))}
              <div className="flex justify-end gap-3 md:col-span-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button>
                <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">
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
