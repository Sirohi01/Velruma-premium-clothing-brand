'use client';

import { useEffect, useState } from 'react';
import { Edit2, Newspaper, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

const blankForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: 'Style',
  tags: '',
  authorName: 'VELRUMA Editorial',
  status: 'draft',
  featured: false,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  seoOgImage: '',
};

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
      category: post.category || 'Style',
      tags: (post.tags || []).join(', '),
      authorName: post.authorName || 'VELRUMA Editorial',
      status: post.status || 'draft',
      featured: post.featured || false,
      seoTitle: post.seo?.title || '',
      seoDescription: post.seo?.description || '',
      seoKeywords: (post.seo?.keywords || []).join(', '),
      seoOgImage: post.seo?.ogImage || '',
    });
    setModalOpen(true);
  };

  const payload = () => ({
    title: form.title,
    slug: form.slug || slugify(form.title),
    excerpt: form.excerpt,
    content: form.content,
    coverImage: form.coverImage,
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
    },
  });

  const savePost = async (event: React.FormEvent) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit Post' : 'New Post'}</h2><button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button></div>
            <form onSubmit={savePost} className="mt-6 grid gap-4 md:grid-cols-2">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input required placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option></select>
              <textarea placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={2} />
              <textarea required placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={8} />
              <ImageUpload label="Cover image" value={form.coverImage} folder="blog" onChange={(coverImage) => setForm({ ...form, coverImage })} />
              <input placeholder="Tags comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="SEO title" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="SEO description" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
              <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button><button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save Post'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
