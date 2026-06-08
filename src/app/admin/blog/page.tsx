'use client';

import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Edit2, FileText, ImageIcon, Newspaper, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

const blankForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  cardImage: '',
  heroImage: '',
  heroImageAspectRatio: '16 / 5',
  heroImagePosition: 'center',
  heroImageFit: 'cover',
  video: '',
  videoAspectRatio: '16 / 9',
  videoPosition: 'center',
  videoFit: 'contain',
  category: 'Style',
  tags: '',
  authorName: 'VELRUMA Editorial',
  status: 'draft',
  featured: false,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  seoOgImage: '',
  seoCanonicalUrl: '',
  seoOgTitle: '',
  seoOgDescription: '',
  seoTwitterTitle: '',
  seoTwitterDescription: '',
  seoSchemaType: 'BlogPosting',
  seoSchemaJson: '',
  seoRobots: 'index,follow',
};

const inputClass = 'h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-amber-500 dark:border-white/10 dark:bg-zinc-950 dark:text-white';
const textareaClass = 'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-amber-500 dark:border-white/10 dark:bg-zinc-950 dark:text-white';
const aspectOptions = [
  { label: '16:5 Hero Banner - 1920x600', value: '16 / 5' },
  { label: '16:9 Wide - 1920x1080', value: '16 / 9' },
  { label: '1:1 Card - 1200x1200', value: '1 / 1' },
  { label: '4:5 Portrait - 1200x1500', value: '4 / 5' },
  { label: '9:16 Reel - 1080x1920', value: '9 / 16' },
];
const positionOptions = ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</span>{children}</label>;
}

function TabButton({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${active ? 'border-zinc-950 text-zinc-950 dark:border-amber-500 dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}><Icon className="h-4 w-4" />{label}</button>;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(blankForm);
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'seo'>('content');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch {
      toast.error('Failed to load blog posts');
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

  const openEdit = (post: any) => {
    setEditTarget(post);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      coverImage: post.coverImage || '',
      cardImage: post.cardImage || post.coverImage || '',
      heroImage: post.heroImage || post.coverImage || '',
      heroImageAspectRatio: post.heroImageAspectRatio || '16 / 5',
      heroImagePosition: post.heroImagePosition || 'center',
      heroImageFit: post.heroImageFit || 'cover',
      video: post.video || '',
      videoAspectRatio: post.videoAspectRatio || '16 / 9',
      videoPosition: post.videoPosition || 'center',
      videoFit: post.videoFit || 'contain',
      category: post.category || 'Style',
      tags: (post.tags || []).join(', '),
      authorName: post.authorName || 'VELRUMA Editorial',
      status: post.status || 'draft',
      featured: post.featured || false,
      seoTitle: post.seo?.title || '',
      seoDescription: post.seo?.description || '',
      seoKeywords: (post.seo?.keywords || []).join(', '),
      seoOgImage: post.seo?.ogImage || '',
      seoCanonicalUrl: post.seo?.canonicalUrl || '',
      seoOgTitle: post.seo?.ogTitle || '',
      seoOgDescription: post.seo?.ogDescription || '',
      seoTwitterTitle: post.seo?.twitterTitle || '',
      seoTwitterDescription: post.seo?.twitterDescription || '',
      seoSchemaType: post.seo?.schemaType || 'BlogPosting',
      seoSchemaJson: post.seo?.schemaJson || '',
      seoRobots: post.seo?.robots || 'index,follow',
    });
    setActiveTab('content');
    setModalOpen(true);
  };

  const payload = () => ({
    title: form.title,
    slug: form.slug || slugify(form.title),
    excerpt: form.excerpt,
    content: form.content,
    coverImage: form.heroImage || form.cardImage || form.coverImage,
    cardImage: form.cardImage,
    heroImage: form.heroImage,
    heroImageAspectRatio: form.heroImageAspectRatio,
    heroImagePosition: form.heroImagePosition,
    heroImageFit: form.heroImageFit,
    video: form.video,
    videoAspectRatio: form.videoAspectRatio,
    videoPosition: form.videoPosition,
    videoFit: form.videoFit,
    category: form.category,
    tags: form.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
    authorName: form.authorName,
    status: form.status,
    featured: form.featured,
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

  const savePost = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/blog/${editTarget._id}` : '/api/blog', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Blog save failed');
        return;
      }
      toast.success(editTarget ? 'Blog updated' : 'Blog created');
      setModalOpen(false);
      fetchPosts();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const archivePost = async (post: any) => {
    await fetch(`/api/blog/${post._id}`, { method: 'DELETE' });
    toast.success('Blog archived');
    fetchPosts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Blog</h1>
          <p className="text-sm text-zinc-500">Create style stories, guides, and editorial posts.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black"><Plus className="h-4 w-4" />New Post</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr><th className="px-6 py-4">Post</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Featured</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center">Loading posts...</td></tr> : posts.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500"><Newspaper className="mx-auto mb-3 h-8 w-8 opacity-20" />No blog posts found.</td></tr>
            ) : posts.map((post) => (
              <tr key={post._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4"><p className="font-medium text-zinc-900 dark:text-white">{post.title}</p><p className="font-mono text-xs text-zinc-500">/blog/{post.slug}</p></td>
                <td className="px-6 py-4">{post.category}</td>
                <td className="px-6 py-4"><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs capitalize text-zinc-700 dark:bg-white/10 dark:text-zinc-200">{post.status}</span></td>
                <td className="px-6 py-4">{post.featured ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => openEdit(post)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button><button onClick={() => archivePost(post)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></td>
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
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit Post' : 'New Post'}</h2>
                <p className="text-xs text-zinc-500">Blog content, card image, hero banner, video, SEO, OG and schema.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={savePost} className="flex min-h-0 flex-1 flex-col">
              <div className="grid gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-white/5 md:grid-cols-[1.2fr_0.8fr_150px_130px]">
                <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} className={inputClass} /></Field>
                <Field label="Slug"><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className={inputClass} /></Field>
                <Field label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} /></Field>
                <Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}><option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option></select></Field>
              </div>
              <div className="flex border-b border-zinc-200 px-4 dark:border-white/10">
                <TabButton icon={FileText} label="Content" active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                <TabButton icon={ImageIcon} label="Media" active={activeTab === 'media'} onClick={() => setActiveTab('media')} />
                <TabButton icon={Search} label="SEO / OG / Schema" active={activeTab === 'seo'} onClick={() => setActiveTab('seo')} />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                {activeTab === 'content' && (
                  <div className="grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Excerpt"><textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={textareaClass} rows={3} /></Field>
                      <div className="grid gap-3">
                        <Field label="Author"><input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className={inputClass} /></Field>
                        <Field label="Tags"><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} placeholder="style, oversized, care" /></Field>
                        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured post</label>
                      </div>
                    </div>
                    <Field label="Content"><textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={textareaClass} rows={14} /></Field>
                  </div>
                )}
                {activeTab === 'media' && (
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                      <ImageUpload label="Card image - 1:1 (1200x1200)" value={form.cardImage} folder="blog/cards" onChange={(cardImage) => setForm({ ...form, cardImage })} />
                      {form.cardImage && <div className="aspect-square overflow-hidden rounded-lg bg-white"><img src={form.cardImage} alt="" className="h-full w-full object-cover object-center" /></div>}
                    </div>
                    <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                      <ImageUpload label="Hero banner - 16:5 (1920x600)" value={form.heroImage} folder="blog/heroes" onChange={(heroImage) => setForm({ ...form, heroImage })} />
                      <Field label="Hero position"><select value={form.heroImagePosition} onChange={(e) => setForm({ ...form, heroImagePosition: e.target.value })} className={inputClass}>{positionOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
                      <Field label="Hero fit"><select value={form.heroImageFit} onChange={(e) => setForm({ ...form, heroImageFit: e.target.value })} className={inputClass}><option value="cover">Cover - banner fill</option><option value="contain">Contain - no crop</option></select></Field>
                      {form.heroImage && <div className="aspect-[16/5] overflow-hidden rounded-lg bg-white"><img src={form.heroImage} alt="" className="h-full w-full" style={{ objectFit: form.heroImageFit, objectPosition: form.heroImagePosition }} /></div>}
                    </div>
                    <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                      <ImageUpload label="Blog video" value={form.video} folder="blog/videos" accept="video" onChange={(video) => setForm({ ...form, video })} />
                      <Field label="Video aspect ratio"><select value={form.videoAspectRatio} onChange={(e) => setForm({ ...form, videoAspectRatio: e.target.value })} className={inputClass}>{aspectOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
                      <Field label="Video position"><select value={form.videoPosition} onChange={(e) => setForm({ ...form, videoPosition: e.target.value })} className={inputClass}>{positionOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
                      <Field label="Video fit"><select value={form.videoFit} onChange={(e) => setForm({ ...form, videoFit: e.target.value })} className={inputClass}><option value="contain">Contain - no crop</option><option value="cover">Cover - fill area</option></select></Field>
                      {form.video && <div className="mx-auto max-h-80 overflow-hidden rounded-lg bg-white" style={{ aspectRatio: form.videoAspectRatio, maxWidth: ['9 / 16', '4 / 5', '1 / 1'].includes(form.videoAspectRatio) ? 'min(100%, 260px)' : undefined }}><video src={form.video} controls muted className="h-full w-full" style={{ objectFit: form.videoFit, objectPosition: form.videoPosition }} /></div>}
                    </div>
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
                    <ImageUpload label="OG image" value={form.seoOgImage} folder="blog/seo" onChange={(seoOgImage) => setForm({ ...form, seoOgImage })} />
                    <div className="grid gap-3"><Field label="Robots"><input value={form.seoRobots} onChange={(e) => setForm({ ...form, seoRobots: e.target.value })} className={inputClass} /></Field><Field label="Schema type"><input value={form.seoSchemaType} onChange={(e) => setForm({ ...form, seoSchemaType: e.target.value })} className={inputClass} /></Field></div>
                    <Field label="Schema JSON"><textarea value={form.seoSchemaJson} onChange={(e) => setForm({ ...form, seoSchemaJson: e.target.value })} className={`${textareaClass} font-mono`} rows={8} /></Field>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-white/10"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button><button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save Post'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
