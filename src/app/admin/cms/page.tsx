'use client';

import { useEffect, useState } from 'react';
import { Edit2, PanelLeft, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

const blankSection = { type: 'text', title: '', body: '', image: '', itemsText: '' };
const blankForm = {
  title: '',
  slug: '',
  type: 'page',
  status: 'draft',
  heroImage: '',
  excerpt: '',
  content: '',
  sections: [blankSection],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  seoOgImage: '',
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function parseItems(text: string) {
  return text.split('\n').map((line) => {
    const [title, body, image, link] = line.split('|').map((item) => item?.trim());
    return title ? { title, body, image, link } : null;
  }).filter(Boolean);
}

export default function AdminCmsPage() {
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
      const res = await fetch('/api/cms');
      const data = await res.json();
      if (data.success) setPages(data.data);
    } catch {
      toast.error('Failed to load CMS pages');
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
      title: page.title || '',
      slug: page.slug || '',
      type: page.type || 'page',
      status: page.status || 'draft',
      heroImage: page.heroImage || '',
      excerpt: page.excerpt || '',
      content: page.content || '',
      sections: page.sections?.length ? page.sections.map((section: any) => ({
        type: section.type,
        title: section.title || '',
        body: section.body || '',
        image: section.image || '',
        itemsText: (section.items || []).map((item: any) => [item.title, item.body, item.image, item.link].filter(Boolean).join(' | ')).join('\n'),
      })) : [blankSection],
      seoTitle: page.seo?.title || '',
      seoDescription: page.seo?.description || '',
      seoKeywords: (page.seo?.keywords || []).join(', '),
      seoOgImage: page.seo?.ogImage || '',
    });
    setModalOpen(true);
  };

  const updateSection = (index: number, patch: any) => {
    setForm({ ...form, sections: form.sections.map((section: any, itemIndex: number) => itemIndex === index ? { ...section, ...patch } : section) });
  };

  const payload = () => ({
    title: form.title,
    slug: form.slug || slugify(form.title),
    type: form.type,
    status: form.status,
    heroImage: form.heroImage,
    excerpt: form.excerpt,
    content: form.content,
    sections: form.sections.map((section: any) => ({
      type: section.type,
      title: section.title,
      body: section.body,
      image: section.image,
      items: parseItems(section.itemsText || ''),
    })),
    seo: {
      title: form.seoTitle,
      description: form.seoDescription,
      keywords: form.seoKeywords.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      ogImage: form.seoOgImage,
    },
  });

  const savePage = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/cms/${editTarget._id}` : '/api/cms', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Page save failed');
        return;
      }
      toast.success(editTarget ? 'Page updated' : 'Page created');
      setModalOpen(false);
      fetchPages();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const archivePage = async (page: any) => {
    await fetch(`/api/cms/${page._id}`, { method: 'DELETE' });
    toast.success('Page archived');
    fetchPages();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>CMS Pages</h1>
          <p className="text-sm text-zinc-500">Manage pages, policies, FAQs, lookbooks, banners and testimonials.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black"><Plus className="h-4 w-4" />New Page</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr><th className="px-6 py-4">Page</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Sections</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center">Loading pages...</td></tr> : pages.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500"><PanelLeft className="mx-auto mb-3 h-8 w-8 opacity-20" />No CMS pages found.</td></tr>
            ) : pages.map((page) => (
              <tr key={page._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4"><p className="font-medium text-zinc-900 dark:text-white">{page.title}</p><p className="font-mono text-xs text-zinc-500">/{page.slug}</p></td>
                <td className="px-6 py-4 capitalize">{page.type}</td>
                <td className="px-6 py-4">{page.sections?.length || 0}</td>
                <td className="px-6 py-4"><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs capitalize text-zinc-700 dark:bg-white/10 dark:text-zinc-200">{page.status}</span></td>
                <td className="px-6 py-4 text-right"><button onClick={() => openEdit(page)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button><button onClick={() => archivePage(page)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit CMS Page' : 'New CMS Page'}</h2><button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button></div>
            <form onSubmit={savePage} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-4">
                <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <input required placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['page', 'policy', 'faq', 'lookbook', 'home-banner', 'popup', 'testimonial'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option></select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ImageUpload label="Hero image" value={form.heroImage} folder="cms" onChange={(heroImage) => setForm({ ...form, heroImage })} />
                <textarea placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={4} />
              </div>
              <textarea placeholder="Main content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={5} />
              <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-white/10">
                <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Sections</h3><button type="button" onClick={() => setForm({ ...form, sections: [...form.sections, blankSection] })} className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 dark:bg-white/10 dark:text-zinc-200">Add Section</button></div>
                {form.sections.map((section: any, index: number) => (
                  <div key={index} className="grid gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-white/5 md:grid-cols-4">
                    <select value={section.type} onChange={(e) => updateSection(index, { type: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2 text-sm dark:border-white/10 dark:bg-zinc-900 dark:text-white">{['text', 'image', 'faq', 'gallery', 'banner', 'testimonial'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
                    <input placeholder="Section title" value={section.title} onChange={(e) => updateSection(index, { title: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2 text-sm dark:border-white/10 dark:bg-zinc-900 dark:text-white" />
                    <input placeholder="Image URL" value={section.image} onChange={(e) => updateSection(index, { image: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2 text-sm dark:border-white/10 dark:bg-zinc-900 dark:text-white" />
                    <button type="button" onClick={() => setForm({ ...form, sections: form.sections.filter((_s: any, i: number) => i !== index) })} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500">Remove</button>
                    <textarea placeholder="Body" value={section.body} onChange={(e) => updateSection(index, { body: e.target.value })} className="md:col-span-2 rounded-lg border border-zinc-200 bg-white p-2 text-sm dark:border-white/10 dark:bg-zinc-900 dark:text-white" rows={3} />
                    <textarea placeholder="Items, one per line: Title | Body | Image URL | Link" value={section.itemsText} onChange={(e) => updateSection(index, { itemsText: e.target.value })} className="md:col-span-2 rounded-lg border border-zinc-200 bg-white p-2 text-sm dark:border-white/10 dark:bg-zinc-900 dark:text-white" rows={3} />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2"><input placeholder="SEO title" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" /><input placeholder="SEO description" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" /></div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button><button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save Page'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
