'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Edit2,
  ExternalLink,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';
import { cn } from '@/lib/utils';

type LookbookType = 'photo' | 'video' | 'instagram';
type LookbookStatus = 'draft' | 'published' | 'archived';

type LookbookItem = {
  _id: string;
  title: string;
  caption: string;
  type: LookbookType;
  mediaUrl: string;
  instagramUrl: string;
  thumbnailUrl: string;
  alt: string;
  category: string;
  season: string;
  tags: string[];
  sortOrder: number;
  isFeatured: boolean;
  status: LookbookStatus;
  isActive: boolean;
};

type LookbookForm = {
  title: string;
  caption: string;
  type: LookbookType;
  mediaUrl: string;
  instagramUrl: string;
  thumbnailUrl: string;
  alt: string;
  category: string;
  season: string;
  tags: string;
  sortOrder: string;
  isFeatured: boolean;
  status: LookbookStatus;
  isActive: boolean;
};

const emptyForm: LookbookForm = {
  title: '',
  caption: '',
  type: 'photo',
  mediaUrl: '',
  instagramUrl: '',
  thumbnailUrl: '',
  alt: '',
  category: '',
  season: '',
  tags: '',
  sortOrder: '0',
  isFeatured: false,
  status: 'published',
  isActive: true,
};

const typeOptions: { value: LookbookType; label: string; icon: typeof ImageIcon }[] = [
  { value: 'photo', label: 'Photo', icon: ImageIcon },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'instagram', label: 'Instagram', icon: ImageIcon },
];

function InstagramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.8" cy="7.2" r="1" fill="currentColor" />
    </svg>
  );
}

function itemToForm(item: LookbookItem): LookbookForm {
  return {
    title: item.title || '',
    caption: item.caption || '',
    type: item.type || 'photo',
    mediaUrl: item.mediaUrl || '',
    instagramUrl: item.instagramUrl || '',
    thumbnailUrl: item.thumbnailUrl || '',
    alt: item.alt || '',
    category: item.category || '',
    season: item.season || '',
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    sortOrder: String(item.sortOrder ?? 0),
    isFeatured: Boolean(item.isFeatured),
    status: item.status || 'published',
    isActive: item.isActive !== false,
  };
}

function previewUrl(item: LookbookItem) {
  if (item.type === 'video') return item.thumbnailUrl || item.mediaUrl;
  return item.type === 'instagram' ? item.thumbnailUrl : item.mediaUrl || item.thumbnailUrl;
}

export default function AdminLookbookPage() {
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LookbookItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LookbookItem | null>(null);
  const [form, setForm] = useState<LookbookForm>(emptyForm);

  const stats = useMemo(() => {
    return {
      total: items.length,
      published: items.filter((item) => item.status === 'published' && item.isActive).length,
      photos: items.filter((item) => item.type === 'photo').length,
      videos: items.filter((item) => item.type === 'video').length,
      instagram: items.filter((item) => item.type === 'instagram').length,
    };
  }, [items]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lookbook', { cache: 'no-store' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to load lookbook');
        return;
      }
      setItems(data.data || []);
    } catch {
      toast.error('Failed to load lookbook');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: LookbookItem) => {
    setEditing(item);
    setForm(itemToForm(item));
    setModalOpen(true);
  };

  const updateForm = <K extends keyof LookbookForm>(key: K, value: LookbookForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveItem = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder || 0),
        tags: form.tags,
      };
      const res = await fetch(editing ? `/api/lookbook/${editing._id}` : '/api/lookbook', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Unable to save lookbook item');
        return;
      }
      toast.success(editing ? 'Lookbook item updated' : 'Lookbook item created');
      setModalOpen(false);
      setEditing(null);
      await loadItems();
    } catch {
      toast.error('Unable to save lookbook item');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async () => {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/lookbook/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Unable to archive item');
        return;
      }
      toast.success('Lookbook item archived');
      setDeleteTarget(null);
      await loadItems();
    } catch {
      toast.error('Unable to archive item');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Content</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Lookbook Gallery</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage photos, videos, and Instagram cards for the website lookbook.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Add lookbook item
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Total', stats.total],
          ['Published', stats.published],
          ['Photos', stats.photos],
          ['Videos', stats.videos],
          ['Instagram', stats.instagram],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Preview</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Category / Season</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Sort</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Loading lookbook...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No lookbook items yet. Add the first visual to start the gallery.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const Icon = typeOptions.find((option) => option.value === item.type)?.icon || ImageIcon;
                  const image = previewUrl(item);
                  return (
                    <tr key={item._id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                          {image ? (
                            item.type === 'video' && !item.thumbnailUrl ? (
                              <video src={image} className="h-full w-full object-cover" muted />
                            ) : (
                              <img src={image} alt={item.alt || item.title} className="h-full w-full object-cover" />
                            )
                          ) : (
                            <Icon className="h-6 w-6 text-zinc-400" />
                          )}
                        </div>
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <p className="font-semibold text-zinc-950">{item.title}</p>
                        <p className="line-clamp-1 text-xs text-zinc-500">{item.caption || item.alt || 'No caption'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold capitalize text-zinc-700">
                          <Icon className="h-3.5 w-3.5" />
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        <p>{item.category || '-'}</p>
                        <p className="text-xs text-zinc-400">{item.season || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
                              item.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700'
                                : item.status === 'archived'
                                  ? 'bg-zinc-100 text-zinc-500'
                                  : 'bg-amber-50 text-amber-700'
                            )}
                          >
                            {item.status}
                          </span>
                          {!item.isActive && <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">Inactive</span>}
                          {item.isFeatured && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{item.sortOrder ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {item.type === 'instagram' && item.instagramUrl && (
                            <a
                              href={item.instagramUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:border-amber-400 hover:text-zinc-950"
                              title="Open Instagram"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:border-amber-400 hover:text-zinc-950"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-500 hover:bg-red-100"
                            title="Archive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950">
                  {editing ? 'Edit Lookbook Item' : 'Add Lookbook Item'}
                </h2>
                <p className="text-sm text-zinc-500">Only published and active items appear on the website lookbook.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid max-h-[calc(90vh-116px)] gap-4 overflow-y-auto p-4 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  {typeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateForm('type', option.value)}
                        className={cn(
                          'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition',
                          form.type === option.value
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-amber-500 hover:text-zinc-950'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Title</span>
                    <input
                      value={form.title}
                      onChange={(event) => updateForm('title', event.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500"
                      placeholder="Summer drop backstage"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Alt text</span>
                    <input
                      value={form.alt}
                      onChange={(event) => updateForm('alt', event.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500"
                      placeholder="VELRUMA oversized t-shirt lookbook"
                    />
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Caption</span>
                  <textarea
                    value={form.caption}
                    onChange={(event) => updateForm('caption', event.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-500"
                    placeholder="Short styling story or campaign note"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Category / Filter</span>
                    <input
                      value={form.category}
                      onChange={(event) => updateForm('category', event.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500"
                      placeholder="Campaign, Streetwear, Studio"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Season / Drop</span>
                    <input
                      value={form.season}
                      onChange={(event) => updateForm('season', event.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500"
                      placeholder="Summer 2026"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Tags</span>
                    <input
                      value={form.tags}
                      onChange={(event) => updateForm('tags', event.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500"
                      placeholder="oversized, premium, campaign"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Sort order</span>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(event) => updateForm('sortOrder', event.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500"
                    />
                  </label>
                </div>

                {form.type === 'instagram' ? (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Instagram URL</span>
                    <input
                      value={form.instagramUrl}
                      onChange={(event) => updateForm('instagramUrl', event.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500"
                      placeholder="https://www.instagram.com/p/..."
                    />
                  </label>
                ) : (
                  <ImageUpload
                    value={form.mediaUrl}
                    onChange={(url) => updateForm('mediaUrl', url)}
                    folder="velruma/lookbook"
                    accept={form.type === 'video' ? 'video' : 'image'}
                    label={form.type === 'video' ? 'Upload video from system' : 'Upload photo from system'}
                  />
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Status</span>
                    <select
                      value={form.status}
                      onChange={(event) => updateForm('status', event.target.value as LookbookStatus)}
                      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-amber-500"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) => updateForm('isActive', event.target.checked)}
                        className="h-4 w-4 accent-amber-500"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(event) => updateForm('isFeatured', event.target.checked)}
                        className="h-4 w-4 accent-amber-500"
                      />
                      Featured
                    </label>
                  </div>
                </div>

                {(form.type === 'instagram' || form.type === 'video') && (
                  <ImageUpload
                    value={form.thumbnailUrl}
                    onChange={(url) => updateForm('thumbnailUrl', url)}
                    folder="velruma/lookbook/thumbnails"
                    accept="image"
                    label={form.type === 'instagram' ? 'Optional Instagram thumbnail' : 'Optional video thumbnail'}
                  />
                )}

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Preview</p>
                  <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    {form.type === 'instagram' ? (
                      form.thumbnailUrl ? (
                        <img src={form.thumbnailUrl} alt="" className="aspect-[4/5] w-full object-cover" />
                      ) : (
                        <div className="flex aspect-[4/5] flex-col items-center justify-center px-6 text-center">
                          <InstagramMark className="h-9 w-9 text-zinc-900" />
                          <p className="mt-3 text-sm font-semibold text-zinc-950">{form.title || 'Instagram lookbook card'}</p>
                          <p className="mt-1 text-xs text-zinc-500">Thumbnail is optional; a clean fallback card will be used.</p>
                        </div>
                      )
                    ) : form.type === 'video' && form.thumbnailUrl ? (
                      <img src={form.thumbnailUrl} alt="" className="aspect-[4/5] w-full object-cover" />
                    ) : form.mediaUrl ? (
                      form.type === 'video' ? (
                        <video src={form.mediaUrl} className="aspect-[4/5] w-full object-cover" muted controls />
                      ) : (
                        <img src={form.mediaUrl} alt="" className="w-full object-cover" />
                      )
                    ) : (
                      <div className="flex aspect-[4/5] flex-col items-center justify-center px-6 text-center text-zinc-400">
                        <ImageIcon className="h-8 w-8" />
                        <p className="mt-3 text-sm">Upload preview will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="h-10 rounded-lg border border-zinc-200 px-4 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveItem}
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-black hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-50 p-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-950">Archive lookbook item?</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  "{deleteTarget.title}" will be hidden from the website and kept as an archived record.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="h-10 rounded-lg border border-zinc-200 px-4 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteItem}
                disabled={deleteLoading}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-70"
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
