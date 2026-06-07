'use client';

import { useEffect, useState } from 'react';
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

const blankForm = {
  path: '/',
  title: '',
  description: '',
  keywords: '',
  ogImage: '',
  canonicalUrl: '',
  robots: 'index,follow',
  schemaType: 'WebPage',
  redirectTo: '',
  isRedirect: false,
};

export default function AdminSeoPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(blankForm);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/seo');
      const data = await res.json();
      if (data.success) setPages(data.data);
    } catch {
      toast.error('Failed to load SEO pages');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(blankForm);
    setModalOpen(true);
  };

  const openEdit = (page: any) => {
    setEditTarget(page);
    setForm({
      path: page.path || '/',
      title: page.title || '',
      description: page.description || '',
      keywords: (page.keywords || []).join(', '),
      ogImage: page.ogImage || '',
      canonicalUrl: page.canonicalUrl || '',
      robots: page.robots || 'index,follow',
      schemaType: page.schemaType || 'WebPage',
      redirectTo: page.redirectTo || '',
      isRedirect: page.isRedirect || false,
    });
    setModalOpen(true);
  };

  const savePage = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/seo/${editTarget._id}` : '/api/seo', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'SEO save failed');
        return;
      }
      toast.success(editTarget ? 'SEO page updated' : 'SEO page created');
      setModalOpen(false);
      fetchPages();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const removePage = async (page: any) => {
    await fetch(`/api/seo/${page._id}`, { method: 'DELETE' });
    toast.success('SEO page removed');
    fetchPages();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>SEO Manager</h1>
          <p className="text-sm text-zinc-500">Manage meta tags, OG images, schema, robots and redirect records.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black"><Plus className="h-4 w-4" />New SEO Page</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Tracked Pages</p><p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{pages.length}</p></div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Avg SEO Score</p><p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{pages.length ? Math.round(pages.reduce((sum, page) => sum + Number(page.score || 0), 0) / pages.length) : 0}</p></div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Redirects</p><p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{pages.filter((page) => page.isRedirect).length}</p></div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr><th className="px-6 py-4">Path</th><th className="px-6 py-4">Title</th><th className="px-6 py-4">Robots</th><th className="px-6 py-4">Score</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center">Loading SEO pages...</td></tr> : pages.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500"><Search className="mx-auto mb-3 h-8 w-8 opacity-20" />No SEO records found.</td></tr>
            ) : pages.map((page) => (
              <tr key={page._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-mono text-xs">{page.path}</td>
                <td className="px-6 py-4"><p className="font-medium text-zinc-900 dark:text-white">{page.title}</p>{page.isRedirect && <p className="text-xs text-amber-500">Redirects to {page.redirectTo}</p>}</td>
                <td className="px-6 py-4">{page.robots}</td>
                <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${page.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>{page.score}</span></td>
                <td className="px-6 py-4 text-right"><button onClick={() => openEdit(page)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button><button onClick={() => removePage(page)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit SEO Page' : 'New SEO Page'}</h2><button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button></div>
            <form onSubmit={savePage} className="mt-6 grid gap-4 md:grid-cols-2">
              <input required placeholder="/path" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value.startsWith('/') ? e.target.value : `/${e.target.value}` })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input required placeholder="Meta title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <textarea required placeholder="Meta description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={3} />
              <input placeholder="Keywords comma separated" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="Canonical URL" value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <select value={form.robots} onChange={(e) => setForm({ ...form, robots: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['index,follow', 'noindex,follow', 'noindex,nofollow'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <select value={form.schemaType} onChange={(e) => setForm({ ...form, schemaType: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['WebPage', 'Product', 'FAQPage', 'BlogPosting', 'CollectionPage'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <ImageUpload label="OG image" value={form.ogImage} folder="seo" onChange={(ogImage) => setForm({ ...form, ogImage })} />
              <div className="space-y-3"><label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"><input type="checkbox" checked={form.isRedirect} onChange={(e) => setForm({ ...form, isRedirect: e.target.checked })} /> 301 redirect record</label><input placeholder="Redirect to" value={form.redirectTo} onChange={(e) => setForm({ ...form, redirectTo: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" /></div>
              <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button><button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save SEO'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
