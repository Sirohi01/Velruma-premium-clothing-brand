'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { CheckCircle2, Edit2, FileJson, Globe, ImageIcon, Plus, Search, Share2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

const inputClass = 'h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-amber-500 dark:border-white/10 dark:bg-zinc-950 dark:text-white';
const textareaClass = 'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-amber-500 dark:border-white/10 dark:bg-zinc-950 dark:text-white';

const pageOptions = [
  '/', '/shop', '/collections', '/lookbook', '/blog', '/about', '/contact', '/faq',
  '/size-guide', '/shipping-policy', '/return-policy', '/privacy-policy', '/terms',
  '/login', '/my-account', '/cart', '/checkout', '/track-order',
  '/product/[slug]', '/category/[slug]', '/collection/[slug]', '/blog/[slug]',
];

const blankForm = {
  path: '/',
  title: '',
  description: '',
  keywords: '',
  metaAuthor: 'VELRUMA',
  metaViewport: 'width=device-width, initial-scale=1',
  canonicalUrl: '',
  robots: 'index,follow',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogType: 'website',
  ogUrl: '',
  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  twitterSite: '',
  twitterCreator: '',
  schemaType: 'WebPage',
  schemaJson: '',
  breadcrumbsJson: '',
  sitemapChangefreq: 'weekly',
  sitemapPriority: 0.7,
  hreflangText: '',
  redirectTo: '',
  isRedirect: false,
};

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

function parseHreflang(text: string) {
  return text.split('\n').map((line) => {
    const [lang, url] = line.split('|').map((item) => item?.trim());
    return lang && url ? { lang, url } : null;
  }).filter(Boolean);
}

function pageCompletion(page: any) {
  const checks = [
    Boolean(page.title),
    Boolean(page.description),
    page.keywords?.length > 0,
    Boolean(page.canonicalUrl),
    Boolean(page.ogTitle && page.ogDescription && page.ogImage),
    Boolean(page.twitterTitle && page.twitterDescription && page.twitterImage),
    Boolean(page.schemaType || page.schemaJson),
  ];
  const done = checks.filter(Boolean).length;
  return { done, total: checks.length, percent: Math.round((done / checks.length) * 100) };
}

export default function AdminSeoPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(blankForm);
  const [activeTab, setActiveTab] = useState<'meta' | 'social' | 'schema'>('meta');

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

  useEffect(() => {
    fetchPages();
  }, []);

  const completed = useMemo(() => pages.filter((page) => pageCompletion(page).percent >= 85).length, [pages]);
  const averageScore = useMemo(() => pages.length ? Math.round(pages.reduce((sum, page) => sum + Number(page.score || 0), 0) / pages.length) : 0, [pages]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(blankForm);
    setActiveTab('meta');
    setModalOpen(true);
  };

  const openEdit = (page: any) => {
    setEditTarget(page);
    setForm({
      path: page.path || '/',
      title: page.title || '',
      description: page.description || '',
      keywords: (page.keywords || []).join(', '),
      metaAuthor: page.metaAuthor || 'VELRUMA',
      metaViewport: page.metaViewport || 'width=device-width, initial-scale=1',
      canonicalUrl: page.canonicalUrl || '',
      robots: page.robots || 'index,follow',
      ogTitle: page.ogTitle || '',
      ogDescription: page.ogDescription || '',
      ogImage: page.ogImage || '',
      ogType: page.ogType || 'website',
      ogUrl: page.ogUrl || '',
      twitterCard: page.twitterCard || 'summary_large_image',
      twitterTitle: page.twitterTitle || '',
      twitterDescription: page.twitterDescription || '',
      twitterImage: page.twitterImage || '',
      twitterSite: page.twitterSite || '',
      twitterCreator: page.twitterCreator || '',
      schemaType: page.schemaType || 'WebPage',
      schemaJson: page.schemaJson || '',
      breadcrumbsJson: page.breadcrumbsJson || '',
      sitemapChangefreq: page.sitemapChangefreq || 'weekly',
      sitemapPriority: page.sitemapPriority ?? 0.7,
      hreflangText: (page.hreflang || []).map((item: any) => `${item.lang} | ${item.url}`).join('\n'),
      redirectTo: page.redirectTo || '',
      isRedirect: page.isRedirect || false,
    });
    setActiveTab('meta');
    setModalOpen(true);
  };

  const payload = () => ({
    ...form,
    keywords: form.keywords.split(',').map((item: string) => item.trim()).filter(Boolean),
    hreflang: parseHreflang(form.hreflangText || ''),
    sitemapPriority: Number(form.sitemapPriority || 0.7),
  });

  const savePage = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/seo/${editTarget._id}` : '/api/seo', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>SEO Manager</h1>
          <p className="text-sm text-zinc-500">Meta, canonical, OG, Twitter/X, schema, sitemap and redirects for every website page.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" />
          New SEO Page
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Tracked Pages" value={pages.length.toString()} />
        <Metric label="SEO Completed" value={`${completed}/${pages.length}`} />
        <Metric label="Avg SEO Score" value={averageScore.toString()} />
        <Metric label="Redirects" value={pages.filter((page) => page.isRedirect).length.toString()} />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr>
              <th className="px-5 py-3">Page</th>
              <th className="px-5 py-3">Meta</th>
              <th className="px-5 py-3">Social</th>
              <th className="px-5 py-3">Schema</th>
              <th className="px-5 py-3">Score</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? <tr><td colSpan={6} className="px-5 py-8 text-center">Loading SEO pages...</td></tr> : pages.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-zinc-500"><Search className="mx-auto mb-3 h-8 w-8 opacity-20" />No SEO records found.</td></tr>
            ) : pages.map((page) => {
              const completion = pageCompletion(page);
              return (
                <tr key={page._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-zinc-900 dark:text-white">{page.path}</p>
                    <p className="mt-1 text-xs text-zinc-500">{completion.done}/{completion.total} items done</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="line-clamp-1 font-medium text-zinc-900 dark:text-white">{page.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{page.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusDot done={Boolean(page.ogTitle && page.ogDescription && page.ogImage)} label="OG" />
                    <StatusDot done={Boolean(page.twitterTitle && page.twitterDescription && page.twitterImage)} label="Twitter" />
                  </td>
                  <td className="px-5 py-4"><StatusDot done={Boolean(page.schemaType || page.schemaJson)} label={page.schemaType || 'Schema'} /></td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${page.score >= 85 ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300' : page.score >= 65 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'}`}>{page.score}</span></td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEdit(page)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => removePage(page)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit SEO Page' : 'New SEO Page'}</h2>
                <p className="text-xs text-zinc-500">Complete all SEO, OG, Twitter and schema fields for the selected website page.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={savePage} className="flex min-h-0 flex-1 flex-col">
              <div className="grid gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-white/5 md:grid-cols-[1fr_1fr_180px_160px]">
                <Field label="Website page dropdown">
                  <select value={form.path} onChange={(event) => setForm({ ...form, path: event.target.value })} className={inputClass}>
                    {pageOptions.map((path) => <option key={path} value={path}>{path}</option>)}
                  </select>
                </Field>
                <Field label="Custom path">
                  <input required value={form.path} onChange={(event) => setForm({ ...form, path: event.target.value.startsWith('/') ? event.target.value : `/${event.target.value}` })} className={inputClass} />
                </Field>
                <Field label="Robots">
                  <select value={form.robots} onChange={(event) => setForm({ ...form, robots: event.target.value })} className={inputClass}>
                    {['index,follow', 'noindex,follow', 'noindex,nofollow'].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Schema type">
                  <select value={form.schemaType} onChange={(event) => setForm({ ...form, schemaType: event.target.value })} className={inputClass}>
                    {['WebPage', 'Product', 'FAQPage', 'BlogPosting', 'CollectionPage', 'AboutPage', 'ContactPage', 'Organization'].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </Field>
              </div>

              <div className="flex border-b border-zinc-200 px-4 dark:border-white/10">
                <TabButton icon={Globe} label="Meta / Sitemap" active={activeTab === 'meta'} onClick={() => setActiveTab('meta')} />
                <TabButton icon={ImageIcon} label="OG + Twitter" active={activeTab === 'social'} onClick={() => setActiveTab('social')} />
                <TabButton icon={FileJson} label="Schema / Advanced" active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                {activeTab === 'meta' && (
                  <div className="grid gap-3 lg:grid-cols-2">
                    <Field label="Meta title" hint={`${form.title.length}/65 characters`}>
                      <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Canonical URL">
                      <input value={form.canonicalUrl} onChange={(event) => setForm({ ...form, canonicalUrl: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Meta description" hint={`${form.description.length}/160 characters`}>
                      <textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className={textareaClass} />
                    </Field>
                    <Field label="Keywords">
                      <textarea value={form.keywords} onChange={(event) => setForm({ ...form, keywords: event.target.value })} rows={3} className={textareaClass} />
                    </Field>
                    <Field label="Meta author"><input value={form.metaAuthor} onChange={(event) => setForm({ ...form, metaAuthor: event.target.value })} className={inputClass} /></Field>
                    <Field label="Viewport"><input value={form.metaViewport} onChange={(event) => setForm({ ...form, metaViewport: event.target.value })} className={inputClass} /></Field>
                    <Field label="Sitemap changefreq">
                      <select value={form.sitemapChangefreq} onChange={(event) => setForm({ ...form, sitemapChangefreq: event.target.value })} className={inputClass}>
                        {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </Field>
                    <Field label="Sitemap priority">
                      <input type="number" min="0" max="1" step="0.1" value={form.sitemapPriority} onChange={(event) => setForm({ ...form, sitemapPriority: event.target.value })} className={inputClass} />
                    </Field>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5 lg:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        <input type="checkbox" checked={form.isRedirect} onChange={(event) => setForm({ ...form, isRedirect: event.target.checked })} />
                        301 redirect record
                      </label>
                      <input placeholder="Redirect to URL" value={form.redirectTo} onChange={(event) => setForm({ ...form, redirectTo: event.target.value })} className={`${inputClass} mt-2`} />
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-lg border border-zinc-200 p-3 dark:border-white/10">
                      <div className="mb-3 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-amber-500" /><h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Open Graph</h3></div>
                      <div className="grid gap-3">
                        <Field label="OG title"><input value={form.ogTitle} onChange={(event) => setForm({ ...form, ogTitle: event.target.value })} className={inputClass} /></Field>
                        <Field label="OG description"><textarea value={form.ogDescription} onChange={(event) => setForm({ ...form, ogDescription: event.target.value })} rows={3} className={textareaClass} /></Field>
                        <Field label="OG type">
                          <select value={form.ogType} onChange={(event) => setForm({ ...form, ogType: event.target.value })} className={inputClass}>
                            {['website', 'article', 'product'].map((item) => <option key={item} value={item}>{item}</option>)}
                          </select>
                        </Field>
                        <Field label="OG URL"><input value={form.ogUrl} onChange={(event) => setForm({ ...form, ogUrl: event.target.value })} className={inputClass} /></Field>
                        <ImageUpload label="OG image" value={form.ogImage} folder="seo/og" onChange={(ogImage) => setForm({ ...form, ogImage })} />
                      </div>
                    </section>

                    <section className="rounded-lg border border-zinc-200 p-3 dark:border-white/10">
                      <div className="mb-3 flex items-center gap-2"><Share2 className="h-4 w-4 text-amber-500" /><h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Twitter / X</h3></div>
                      <div className="grid gap-3">
                        <Field label="Twitter card">
                          <select value={form.twitterCard} onChange={(event) => setForm({ ...form, twitterCard: event.target.value })} className={inputClass}>
                            {['summary_large_image', 'summary'].map((item) => <option key={item} value={item}>{item}</option>)}
                          </select>
                        </Field>
                        <Field label="Twitter title"><input value={form.twitterTitle} onChange={(event) => setForm({ ...form, twitterTitle: event.target.value })} className={inputClass} /></Field>
                        <Field label="Twitter description"><textarea value={form.twitterDescription} onChange={(event) => setForm({ ...form, twitterDescription: event.target.value })} rows={3} className={textareaClass} /></Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Twitter site"><input value={form.twitterSite} onChange={(event) => setForm({ ...form, twitterSite: event.target.value })} className={inputClass} /></Field>
                          <Field label="Twitter creator"><input value={form.twitterCreator} onChange={(event) => setForm({ ...form, twitterCreator: event.target.value })} className={inputClass} /></Field>
                        </div>
                        <ImageUpload label="Twitter image" value={form.twitterImage} folder="seo/twitter" onChange={(twitterImage) => setForm({ ...form, twitterImage })} />
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'schema' && (
                  <div className="grid gap-3 lg:grid-cols-2">
                    <Field label="Schema JSON-LD">
                      <textarea value={form.schemaJson} onChange={(event) => setForm({ ...form, schemaJson: event.target.value })} rows={10} className={`${textareaClass} font-mono`} />
                    </Field>
                    <Field label="Breadcrumbs JSON-LD">
                      <textarea value={form.breadcrumbsJson} onChange={(event) => setForm({ ...form, breadcrumbsJson: event.target.value })} rows={10} className={`${textareaClass} font-mono`} />
                    </Field>
                    <Field label="Hreflang entries" hint="One per line: en-IN | https://example.com/page">
                      <textarea value={form.hreflangText} onChange={(event) => setForm({ ...form, hreflangText: event.target.value })} rows={4} className={`${textareaClass} lg:col-span-2`} />
                    </Field>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 lg:col-span-2">
                      Use valid JSON-LD for schema and breadcrumbs. Page dropdown covers common website pages; dynamic pages can use patterns like /product/[slug].
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-200 px-4 py-3 dark:border-white/10">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button>
                <button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save SEO'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${active ? 'border-zinc-950 text-zinc-950 dark:border-amber-500 dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function StatusDot({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={`mr-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${done ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300' : 'bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400'}`}>
      {done && <CheckCircle2 className="h-3 w-3" />}
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}
