'use client';

import { useEffect, useState } from 'react';
import { Copy, Edit2, ImageIcon, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '@/components/shared/DataTable';
import ImageUpload from '@/components/shared/ImageUpload';

const emptyForm = { title: '', url: '', type: 'image', folder: 'media-library', alt: '', isActive: true };

export default function MediaPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    const res = await fetch('/api/media');
    const data = await res.json();
    if (data.success) setAssets(data.data);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (asset: any) => {
    setEditTarget(asset);
    setForm({
      title: asset.title || '',
      url: asset.url || '',
      type: asset.type || 'image',
      folder: asset.folder || 'media-library',
      alt: asset.alt || '',
      isActive: asset.isActive ?? true,
    });
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const res = await fetch(editTarget ? `/api/media/${editTarget._id}` : '/api/media', {
      method: editTarget ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Media saved');
      setModalOpen(false);
      fetchAssets();
    } else {
      toast.error(data.error || 'Media save failed');
    }
  };

  const deactivate = async (asset: any) => {
    const res = await fetch(`/api/media/${asset._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast.success('Media deactivated');
      fetchAssets();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Media Library</h1>
          <p className="text-sm text-zinc-500">Upload, reuse and organize Cloudinary images and videos.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" /> Add Media
        </button>
      </div>

      <DataTable
        data={assets}
        empty="No media assets found."
        columns={[
          {
            key: 'preview',
            header: 'Preview',
            cell: (asset: any) => asset.url ? (
              asset.type === 'video' ? <video src={asset.url} className="h-12 w-12 rounded-lg object-cover" muted /> : <img src={asset.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
            ) : <ImageIcon className="h-5 w-5 text-zinc-400" />,
          },
          { key: 'title', header: 'Title', cell: (asset: any) => <span className="font-medium text-zinc-900 dark:text-white">{asset.title}</span> },
          { key: 'type', header: 'Type', cell: (asset: any) => asset.type },
          { key: 'folder', header: 'Folder', cell: (asset: any) => asset.folder || '-' },
          {
            key: 'actions',
            header: 'Actions',
            className: 'px-5 py-3 text-right',
            cell: (asset: any) => (
              <div className="flex justify-end gap-1">
                <button onClick={() => navigator.clipboard.writeText(asset.url).then(() => toast.success('URL copied'))} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><Copy className="h-4 w-4" /></button>
                <button onClick={() => openEdit(asset)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => deactivate(asset)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            ),
          },
        ]}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{editTarget ? 'Edit Media' : 'Add Media'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={save} className="mt-6 grid gap-4">
              <ImageUpload value={form.url} onChange={(url) => setForm({ ...form, url, type: /\.(mp4|webm|mov)$/i.test(url.split('?')[0]) ? 'video' : 'image' })} folder={form.folder || 'media-library'} accept="media" label="Upload from system" />
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <div className="grid gap-4 md:grid-cols-2">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                  {['image', 'video', 'document'].map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <input placeholder="Folder" value={form.folder} onChange={(e) => setForm({ ...form, folder: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>
              <input placeholder="Alt text" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button>
                <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black">Save Media</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
