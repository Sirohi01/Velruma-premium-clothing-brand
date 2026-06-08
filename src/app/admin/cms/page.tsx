'use client';

import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Edit2, FileText, ImageIcon, PanelLeft, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

const aspectOptions = [
  { label: '16:9 Wide - 1920x1080', value: '16 / 9' },
  { label: '16:5 Banner - 1920x600', value: '16 / 5' },
  { label: '21:9 Cinematic - 2100x900', value: '21 / 9' },
  { label: '4:3 Editorial - 1600x1200', value: '4 / 3' },
  { label: '3:2 Photo - 1800x1200', value: '3 / 2' },
  { label: '1:1 Square - 1200x1200', value: '1 / 1' },
  { label: '4:5 Portrait - 1200x1500', value: '4 / 5' },
  { label: '9:16 Reel - 1080x1920', value: '9 / 16' },
];

const positionOptions = [
  { label: 'Center', value: 'center' },
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
  { label: 'Top Left', value: 'top left' },
  { label: 'Top Right', value: 'top right' },
  { label: 'Bottom Left', value: 'bottom left' },
  { label: 'Bottom Right', value: 'bottom right' },
];

const blankSection = { type: 'text', title: '', body: '', image: '', imageAspectRatio: '16 / 9', imagePosition: 'center', video: '', videoAspectRatio: '16 / 9', videoPosition: 'center', mediaFit: 'cover', itemsText: '' };
const blankForm = {
  title: '',
  slug: '',
  type: 'page',
  status: 'draft',
  heroImage: '',
  heroImageAspectRatio: '16 / 9',
  heroImagePosition: 'center',
  heroImageFit: 'contain',
  heroVideo: '',
  heroVideoAspectRatio: '16 / 9',
  heroVideoPosition: 'center',
  heroVideoFit: 'contain',
  excerpt: '',
  content: '',
  sections: [blankSection],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  seoOgImage: '',
  seoCanonicalUrl: '',
  seoOgTitle: '',
  seoOgDescription: '',
  seoTwitterTitle: '',
  seoTwitterDescription: '',
  seoSchemaType: 'WebPage',
  seoSchemaJson: '',
  seoRobots: 'index,follow',
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

const inputClass = 'h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-amber-500 dark:border-white/10 dark:bg-zinc-950 dark:text-white';
const textareaClass = 'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-amber-500 dark:border-white/10 dark:bg-zinc-950 dark:text-white';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${active ? 'border-zinc-950 text-zinc-950 dark:border-amber-500 dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function AdminCmsPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(blankForm);
  const [activeTab, setActiveTab] = useState<'content' | 'sections' | 'seo'>('content');

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
    setActiveTab('content');
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
      heroImageAspectRatio: page.heroImageAspectRatio || '16 / 9',
      heroImagePosition: page.heroImagePosition || 'center',
      heroImageFit: page.heroImageFit || 'contain',
      heroVideo: page.heroVideo || '',
      heroVideoAspectRatio: page.heroVideoAspectRatio || '16 / 9',
      heroVideoPosition: page.heroVideoPosition || 'center',
      heroVideoFit: page.heroVideoFit || 'contain',
      excerpt: page.excerpt || '',
      content: page.content || '',
      sections: page.sections?.length ? page.sections.map((section: any) => ({
        type: section.type,
        title: section.title || '',
        body: section.body || '',
        image: section.image || '',
        imageAspectRatio: section.imageAspectRatio || '16 / 9',
        imagePosition: section.imagePosition || 'center',
        video: section.video || '',
        videoAspectRatio: section.videoAspectRatio || '16 / 9',
        videoPosition: section.videoPosition || 'center',
        mediaFit: section.mediaFit || 'cover',
        itemsText: (section.items || []).map((item: any) => [item.title, item.body, item.image, item.link].filter(Boolean).join(' | ')).join('\n'),
      })) : [blankSection],
      seoTitle: page.seo?.title || '',
      seoDescription: page.seo?.description || '',
      seoKeywords: (page.seo?.keywords || []).join(', '),
      seoOgImage: page.seo?.ogImage || '',
      seoCanonicalUrl: page.seo?.canonicalUrl || '',
      seoOgTitle: page.seo?.ogTitle || '',
      seoOgDescription: page.seo?.ogDescription || '',
      seoTwitterTitle: page.seo?.twitterTitle || '',
      seoTwitterDescription: page.seo?.twitterDescription || '',
      seoSchemaType: page.seo?.schemaType || 'WebPage',
      seoSchemaJson: page.seo?.schemaJson || '',
      seoRobots: page.seo?.robots || 'index,follow',
    });
    setActiveTab('content');
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
    heroImageAspectRatio: form.heroImageAspectRatio,
    heroImagePosition: form.heroImagePosition,
    heroImageFit: form.heroImageFit,
    heroVideo: form.heroVideo,
    heroVideoAspectRatio: form.heroVideoAspectRatio,
    heroVideoPosition: form.heroVideoPosition,
    heroVideoFit: form.heroVideoFit,
    excerpt: form.excerpt,
    content: form.content,
    sections: form.sections.map((section: any) => ({
      type: section.type,
      title: section.title,
      body: section.body,
      image: section.image,
      imageAspectRatio: section.imageAspectRatio,
      imagePosition: section.imagePosition,
      video: section.video,
      videoAspectRatio: section.videoAspectRatio,
      videoPosition: section.videoPosition,
      mediaFit: section.mediaFit,
      items: parseItems(section.itemsText || ''),
    })),
    seo: {
      title: form.seoTitle,
      description: form.seoDescription,
      keywords: form.seoKeywords.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      ogImage: form.seoOgImage,
      canonicalUrl: form.seoCanonicalUrl,
      ogTitle: form.seoOgTitle,
      ogDescription: form.seoOgDescription,
      twitterTitle: form.seoTwitterTitle,
      twitterDescription: form.seoTwitterDescription,
      schemaType: form.seoSchemaType,
      schemaJson: form.seoSchemaJson,
      robots: form.seoRobots,
    },
  });

  const savePage = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const editId = editTarget?._id || editTarget?.slug;
      const res = await fetch(editTarget ? `/api/cms/${editId}` : '/api/cms', {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit CMS Page' : 'New CMS Page'}</h2>
                <p className="text-xs text-zinc-500">Content, sections, meta, OG, Twitter and schema in one place.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={savePage} className="flex min-h-0 flex-1 flex-col">
              <div className="grid gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-white/5 md:grid-cols-[1.2fr_0.8fr_160px_140px]">
                <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} className={inputClass} /></Field>
                <Field label="Slug"><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className={inputClass} /></Field>
                <Field label="Type"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>{['page', 'policy', 'faq', 'lookbook', 'home-banner', 'popup', 'testimonial'].map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
                <Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}><option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option></select></Field>
              </div>

              <div className="flex border-b border-zinc-200 px-4 dark:border-white/10">
                <TabButton icon={FileText} label="Content" active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                <TabButton icon={ImageIcon} label={`Sections (${form.sections.length})`} active={activeTab === 'sections'} onClick={() => setActiveTab('sections')} />
                <TabButton icon={Search} label="SEO / OG / Schema" active={activeTab === 'seo'} onClick={() => setActiveTab('seo')} />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                {activeTab === 'content' && (
                  <div className="grid gap-3 lg:grid-cols-[340px_1fr]">
                    <div className="space-y-3">
                      <ImageUpload label="Hero image" value={form.heroImage} folder="cms" onChange={(heroImage) => setForm({ ...form, heroImage })} />
                      <Field label="Hero image aspect ratio">
                        <select value={form.heroImageAspectRatio} onChange={(e) => setForm({ ...form, heroImageAspectRatio: e.target.value })} className={inputClass}>
                          {aspectOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Hero image position">
                        <select value={form.heroImagePosition} onChange={(e) => setForm({ ...form, heroImagePosition: e.target.value })} className={inputClass}>
                          {positionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Hero image fit">
                        <select value={form.heroImageFit} onChange={(e) => setForm({ ...form, heroImageFit: e.target.value })} className={inputClass}>
                          <option value="contain">Contain - full image, no crop</option>
                          <option value="cover">Cover - fill area, may crop</option>
                        </select>
                      </Field>
                      <ImageUpload label="Hero video" value={form.heroVideo} folder="cms/videos" accept="video" onChange={(heroVideo) => setForm({ ...form, heroVideo })} />
                      <Field label="Hero video aspect ratio">
                        <select value={form.heroVideoAspectRatio} onChange={(e) => setForm({ ...form, heroVideoAspectRatio: e.target.value })} className={inputClass}>
                          {aspectOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Hero video position">
                        <select value={form.heroVideoPosition} onChange={(e) => setForm({ ...form, heroVideoPosition: e.target.value })} className={inputClass}>
                          {positionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Hero video fit">
                        <select value={form.heroVideoFit} onChange={(e) => setForm({ ...form, heroVideoFit: e.target.value })} className={inputClass}>
                          <option value="contain">Contain - full video, no crop</option>
                          <option value="cover">Cover - fill area, may crop</option>
                        </select>
                      </Field>
                      {(form.heroVideo || form.heroImage) && (
                        <div>
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">Hero preview</span>
                          <div className="grid gap-2">
                            {form.heroImage && (
                              <div className="relative mx-auto max-h-80 w-full overflow-hidden rounded-lg bg-zinc-100" style={{ aspectRatio: form.heroImageAspectRatio, maxWidth: ['9 / 16', '4 / 5', '1 / 1'].includes(form.heroImageAspectRatio || '') ? 'min(100%, 260px)' : undefined }}>
                                {form.heroImageFit === 'contain' && <img src={form.heroImage} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-25 blur-xl" style={{ objectPosition: form.heroImagePosition || 'center' }} />}
                                <img src={form.heroImage} alt="" className="relative h-full w-full" style={{ objectFit: form.heroImageFit || 'contain', objectPosition: form.heroImagePosition || 'center' }} />
                              </div>
                            )}
                            {form.heroVideo && (
                              <div className="mx-auto max-h-80 w-full overflow-hidden rounded-lg bg-zinc-100" style={{ aspectRatio: form.heroVideoAspectRatio, maxWidth: ['9 / 16', '4 / 5', '1 / 1'].includes(form.heroVideoAspectRatio || '') ? 'min(100%, 260px)' : undefined }}>
                                <video src={form.heroVideo} className="h-full w-full" style={{ objectFit: form.heroVideoFit || 'contain', objectPosition: form.heroVideoPosition || 'center' }} muted controls />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                        Page par media selected aspect ratio me hi open hogi. Best banners: 16:5. Standard page hero/video: 16:9.
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <Field label="Excerpt"><textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={textareaClass} rows={3} /></Field>
                      <Field label="Main content"><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={textareaClass} rows={9} /></Field>
                    </div>
                  </div>
                )}

                {activeTab === 'sections' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">Page Sections</p>
                      <button type="button" onClick={() => setForm({ ...form, sections: [...form.sections, blankSection] })} className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white dark:bg-amber-500 dark:text-black">Add Section</button>
                    </div>
                    {form.sections.map((section: any, index: number) => (
                      <div key={index} className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5 lg:grid-cols-[140px_1fr_260px_260px_90px]">
                        <select value={section.type} onChange={(e) => updateSection(index, { type: e.target.value })} className={inputClass}>{['text', 'image', 'faq', 'gallery', 'banner', 'testimonial'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
                        <input placeholder="Section title" value={section.title} onChange={(e) => updateSection(index, { title: e.target.value })} className={inputClass} />
                        <ImageUpload label="Image" value={section.image} folder="cms/sections" onChange={(image) => updateSection(index, { image })} />
                        <ImageUpload label="Video" value={section.video} folder="cms/section-videos" accept="video" onChange={(video) => updateSection(index, { video })} />
                        <button type="button" onClick={() => setForm({ ...form, sections: form.sections.filter((_s: any, i: number) => i !== index) })} className="h-10 rounded-lg bg-red-50 px-3 text-xs font-semibold text-red-600">Remove</button>
                        <Field label="Image ratio">
                          <select value={section.imageAspectRatio || '16 / 9'} onChange={(e) => updateSection(index, { imageAspectRatio: e.target.value })} className={inputClass}>
                            {aspectOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </Field>
                        <Field label="Image position">
                          <select value={section.imagePosition || 'center'} onChange={(e) => updateSection(index, { imagePosition: e.target.value })} className={inputClass}>
                            {positionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </Field>
                        <Field label="Video ratio">
                          <select value={section.videoAspectRatio || '16 / 9'} onChange={(e) => updateSection(index, { videoAspectRatio: e.target.value })} className={inputClass}>
                            {aspectOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </Field>
                        <Field label="Video position">
                          <select value={section.videoPosition || 'center'} onChange={(e) => updateSection(index, { videoPosition: e.target.value })} className={inputClass}>
                            {positionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </Field>
                        <Field label="Media fit">
                          <select value={section.mediaFit || 'cover'} onChange={(e) => updateSection(index, { mediaFit: e.target.value })} className={inputClass}>
                            <option value="cover">Cover - fill area</option>
                            <option value="contain">Contain - no crop</option>
                          </select>
                        </Field>
                        {(section.video || section.image) && (
                          <div className="lg:col-span-2">
                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">Section preview</span>
                            <div className="grid gap-2">
                              {section.image && (
                                <div className="mx-auto max-h-72 w-full overflow-hidden rounded-lg bg-zinc-100" style={{ aspectRatio: section.imageAspectRatio || '16 / 9', maxWidth: ['9 / 16', '4 / 5', '1 / 1'].includes(section.imageAspectRatio || '') ? 'min(100%, 240px)' : undefined }}>
                                  <img src={section.image} alt="" className="h-full w-full" style={{ objectFit: section.mediaFit || 'cover', objectPosition: section.imagePosition || 'center' }} />
                                </div>
                              )}
                              {section.video && (
                                <div className="mx-auto max-h-72 w-full overflow-hidden rounded-lg bg-zinc-100" style={{ aspectRatio: section.videoAspectRatio || '16 / 9', maxWidth: ['9 / 16', '4 / 5', '1 / 1'].includes(section.videoAspectRatio || '') ? 'min(100%, 240px)' : undefined }}>
                                  <video src={section.video} className="h-full w-full" style={{ objectFit: section.mediaFit || 'cover', objectPosition: section.videoPosition || 'center' }} muted controls />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <textarea placeholder="Body" value={section.body} onChange={(e) => updateSection(index, { body: e.target.value })} className={`${textareaClass} lg:col-span-2`} rows={3} />
                        <textarea placeholder="Items: Title | Body, one per line" value={section.itemsText} onChange={(e) => updateSection(index, { itemsText: e.target.value })} className={`${textareaClass} lg:col-span-3`} rows={3} />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="grid gap-3 lg:grid-cols-2">
                    <Field label="Meta title"><input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className={inputClass} /></Field>
                    <Field label="Canonical URL"><input value={form.seoCanonicalUrl} onChange={(e) => setForm({ ...form, seoCanonicalUrl: e.target.value })} className={inputClass} /></Field>
                    <Field label="Meta description"><textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} className={textareaClass} rows={3} /></Field>
                    <Field label="Keywords"><textarea value={form.seoKeywords} onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })} className={textareaClass} rows={3} /></Field>
                    <Field label="OG title"><input value={form.seoOgTitle} onChange={(e) => setForm({ ...form, seoOgTitle: e.target.value })} className={inputClass} /></Field>
                    <Field label="Twitter title"><input value={form.seoTwitterTitle} onChange={(e) => setForm({ ...form, seoTwitterTitle: e.target.value })} className={inputClass} /></Field>
                    <Field label="OG description"><textarea value={form.seoOgDescription} onChange={(e) => setForm({ ...form, seoOgDescription: e.target.value })} className={textareaClass} rows={3} /></Field>
                    <Field label="Twitter description"><textarea value={form.seoTwitterDescription} onChange={(e) => setForm({ ...form, seoTwitterDescription: e.target.value })} className={textareaClass} rows={3} /></Field>
                    <ImageUpload label="OG image" value={form.seoOgImage} folder="seo" onChange={(seoOgImage) => setForm({ ...form, seoOgImage })} />
                    <div className="grid gap-3">
                      <Field label="Robots"><input value={form.seoRobots} onChange={(e) => setForm({ ...form, seoRobots: e.target.value })} className={inputClass} /></Field>
                      <Field label="Schema type"><input value={form.seoSchemaType} onChange={(e) => setForm({ ...form, seoSchemaType: e.target.value })} className={inputClass} /></Field>
                    </div>
                    <Field label="Schema JSON"><textarea value={form.seoSchemaJson} onChange={(e) => setForm({ ...form, seoSchemaJson: e.target.value })} className={`${textareaClass} font-mono`} rows={8} /></Field>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-500 dark:border-white/10 dark:bg-white/5">
                      Schema example: WebPage, FAQPage, AboutPage, CollectionPage. Paste valid JSON-LD object only. Public renderer can use these saved fields later for exact page SEO output.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-white/10">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button>
                <button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save Page'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
