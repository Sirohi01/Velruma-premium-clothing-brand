'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '@/components/shared/DataTable';
import ImageUpload from '@/components/shared/ImageUpload';

export type Phase9Field = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'json' | 'image';
  options?: string[];
  optionsEndpoint?: string;
  optionValueKey?: string;
  optionLabelKey?: string;
  required?: boolean;
  folder?: string;
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
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(defaults);
  const [remoteOptions, setRemoteOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const pageSize = 8;

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
    fetchRemoteOptions();
  }, [page]);

  const fetchRemoteOptions = async () => {
    const endpointFields = fields.filter((field) => field.optionsEndpoint);
    if (!endpointFields.length) return;

    const next: Record<string, { value: string; label: string }[]> = {};
    await Promise.all(endpointFields.map(async (field) => {
      try {
        const res = await fetch(field.optionsEndpoint as string);
        const data = await res.json();
        if (!data.success) return;
        next[field.key] = (data.data || []).map((item: any) => ({
          value: String(item[field.optionValueKey || 'value'] || ''),
          label: String(item[field.optionLabelKey || 'label'] || item.name || item.title || ''),
        })).filter((item: { value: string; label: string }) => item.value && item.label);
      } catch {
        next[field.key] = [];
      }
    }));
    setRemoteOptions(next);
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const separator = endpoint.includes('?') ? '&' : '?';
      const res = await fetch(`${endpoint}${separator}page=${page}&limit=${pageSize}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        if (data.pagination) setPagination(data.pagination);
      }
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

  const deactivate = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${endpoint}/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Record deactivated');
        setDeleteTarget(null);
        fetchRecords();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
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
    <div className="space-y-4">
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
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: setPage,
        }}
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
                <button onClick={() => setDeleteTarget(record)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{editTarget ? `Edit ${title}` : `Add ${title}`}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={saveRecord} className="mt-5 grid gap-3 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className={field.type === 'textarea' || field.type === 'json' || field.type === 'image' ? 'md:col-span-2' : ''}>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{field.label}</span>
                  {field.type === 'image' ? (
                    <ImageUpload
                      label={field.label}
                      value={form[field.key] || ''}
                      folder={field.folder || 'admin'}
                      onChange={(value) => setForm({ ...form, [field.key]: value })}
                    />
                  ) : field.type === 'json' ? (
                    <textarea
                      value={typeof form[field.key] === 'string' ? form[field.key] : JSON.stringify(form[field.key] || {}, null, 2)}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      rows={5}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 font-mono text-xs dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea required={field.required} value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} rows={3} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  ) : field.type === 'select' ? (
                    field.optionsEndpoint ? (
                      <>
                        <input
                          list={`${field.key}-options`}
                          value={form[field.key] || ''}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          placeholder={`Search ${field.label.toLowerCase()}...`}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                        <datalist id={`${field.key}-options`}>
                          {(remoteOptions[field.key] || []).map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </datalist>
                      </>
                    ) : (
                      <select value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {(field.options || []).map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
                      </select>
                    )
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

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl dark:bg-zinc-950">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-950 dark:text-white">Deactivate record?</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {deleteTarget.title || deleteTarget.name || 'This record'} will be hidden from active workflows. You can keep its history for audit.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">
                Cancel
              </button>
              <button type="button" disabled={deleting} onClick={deactivate} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
