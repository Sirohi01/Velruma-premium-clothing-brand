'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingState from '@/components/shared/LoadingState';
import ImageUpload from '@/components/shared/ImageUpload';

const highlightIconOptions = [
  { value: 'shirt', label: 'T-shirt' },
  { value: 'maximize', label: 'Fit' },
  { value: 'droplet', label: 'Fabric / Drop' },
  { value: 'users', label: 'Audience' },
  { value: 'sparkles', label: 'Premium' },
  { value: 'shield', label: 'Quality' },
];

const defaultHighlights = [
  { icon: 'shirt', title: 'PREMIUM COTTON', subtitle: '240 GSM Fabric' },
  { icon: 'maximize', title: 'OVERSIZED FIT', subtitle: 'Relaxed & Comfortable' },
  { icon: 'droplet', title: 'MINIMAL DESIGN', subtitle: 'Signature Logo' },
  { icon: 'users', title: 'UNISEX', subtitle: 'For Everyone' },
];

const productTabs = [
  { id: 'basics', label: 'Basics' },
  { id: 'media', label: 'Media' },
  { id: 'variants', label: 'Variants' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(null);
  const [activeProductTab, setActiveProductTab] = useState('basics');

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${params.id}`).then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/collections').then((res) => res.json()),
    ])
      .then(([productData, categoryData, collectionData]) => {
        if (productData.success) {
          const product = productData.data;
          setFormData({
            ...product,
            category: product.category?._id || product.category || '',
            collections: (product.collections || []).map((collection: any) => collection._id || collection),
            images: product.images?.length ? product.images : [{ url: '', alt: '', isPrimary: true }],
            videos: product.videos || [],
            variants: product.variants?.length ? product.variants : [{ size: '', color: '', stock: 0, extraPrice: 0, sku: '', barcode: '' }],
            productHighlights: product.productHighlights?.length ? product.productHighlights : defaultHighlights,
            productDetailsText: (product.productDetails || []).join('\n'),
            washCareText: (product.washCare || []).join('\n'),
            deliveryReturnsText: (product.deliveryReturns || []).join('\n'),
          });
        }
        setCategories(categoryData.success ? categoryData.data : []);
        setCollections(collectionData.success ? collectionData.data : []);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading || !formData) return <LoadingState label="Loading product..." />;

  const updateVariant = (index: number, key: string, value: unknown) => {
    const variants = [...formData.variants];
    variants[index] = { ...variants[index], [key]: value };
    setFormData({ ...formData, variants });
  };

  const updateImage = (index: number, key: string, value: unknown) => {
    const images = [...formData.images];
    images[index] = { ...images[index], [key]: value };
    setFormData({ ...formData, images });
  };

  const updateVideo = (index: number, key: string, value: unknown) => {
    const videos = [...(formData.videos || [])];
    videos[index] = { ...videos[index], [key]: value };
    setFormData({ ...formData, videos });
  };

  const updateHighlight = (index: number, key: string, value: string) => {
    const productHighlights = [...(formData.productHighlights || [])];
    productHighlights[index] = { ...productHighlights[index], [key]: value };
    setFormData({ ...formData, productHighlights });
  };

  const toggleCollection = (collectionId: string) => {
    const selectedCollections = formData.collections || [];
    const exists = selectedCollections.includes(collectionId);
    setFormData({
      ...formData,
      collections: exists
        ? selectedCollections.filter((id: string) => id !== collectionId)
        : [...selectedCollections, collectionId],
    });
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productDetails: (formData.productDetailsText || '').split('\n').filter(Boolean),
          washCare: (formData.washCareText || '').split('\n').filter(Boolean),
          deliveryReturns: (formData.deliveryReturnsText || '').split('\n').filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Product updated');
        router.push('/admin/products');
      } else {
        toast.error(data.error || 'Failed to update product');
      }
    } catch {
      toast.error('Network error while updating product');
    } finally {
      setSaving(false);
    }
  };

  const sellingBeforeDiscount = Number(formData.salePrice || formData.basePrice || 0);
  const extraDiscount = formData.discountType === 'percentage'
    ? Math.round((sellingBeforeDiscount * Number(formData.discountValue || 0)) / 100)
    : formData.discountType === 'fixed'
      ? Number(formData.discountValue || 0)
      : 0;
  const finalSellingPrice = Math.max(0, sellingBeforeDiscount - extraDiscount);
  const totalDiscount = Math.max(0, Number(formData.basePrice || 0) - finalSellingPrice);
  const discountPercent = formData.basePrice > 0 ? Math.round((totalDiscount / Number(formData.basePrice || 1)) * 100) : 0;
  const profit = finalSellingPrice - Number(formData.costPrice || 0);
  const marginPercent = finalSellingPrice > 0 ? Math.round((profit / finalSellingPrice) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-3 pb-8">
      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-950" style={{ fontFamily: "'Playfair Display', serif" }}>Edit Product</h1>
            <p className="text-sm text-zinc-500">{formData.title}</p>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="flex h-10 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-bold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {productTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveProductTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeProductTab === tab.id ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <Panel title="General" className={activeProductTab !== 'basics' ? 'hidden' : ''}>
            <Input label="Title" value={formData.title} onChange={(value) => setFormData({ ...formData, title: value })} />
            <Input label="Slug" value={formData.slug} onChange={(value) => setFormData({ ...formData, slug: value })} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Description</span>
              <textarea value={formData.description || ''} onChange={(event) => setFormData({ ...formData, description: event.target.value })} rows={4} className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus:border-amber-500" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Product Details (One point per line)</span>
              <textarea value={formData.productDetailsText || ''} onChange={(event) => setFormData({ ...formData, productDetailsText: event.target.value })} rows={3} className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus:border-amber-500" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Wash Care (One point per line)</span>
              <textarea value={formData.washCareText || ''} onChange={(event) => setFormData({ ...formData, washCareText: event.target.value })} rows={3} className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus:border-amber-500" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Delivery & Returns (One point per line)</span>
              <textarea value={formData.deliveryReturnsText || ''} onChange={(event) => setFormData({ ...formData, deliveryReturnsText: event.target.value })} rows={3} className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus:border-amber-500" />
            </label>
          </Panel>

          <Panel title="Media" className={activeProductTab !== 'media' ? 'hidden' : ''}>
            {formData.images.map((image: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-1">
                  <ImageUpload
                    label={index === 0 ? 'Primary image' : `Image ${index + 1}`}
                    value={image.url || ''}
                    folder="products"
                    onChange={(url) => updateImage(index, 'url', url)}
                  />
                  <Input label="Image alt text" value={image.alt || ''} onChange={(value) => updateImage(index, 'alt', value)} />
                </div>
                <button onClick={() => setFormData({ ...formData, images: formData.images.filter((_: any, i: number) => i !== index) })} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={() => setFormData({ ...formData, images: [...formData.images, { url: '', alt: '', isPrimary: false }] })} className="flex items-center gap-2 text-sm font-bold text-amber-600">
              <Plus className="h-4 w-4" />
              Add image
            </button>
          </Panel>

          <Panel title="Product Videos" className={activeProductTab !== 'media' ? 'hidden' : ''}>
            {(formData.videos || []).length === 0 && <p className="text-sm text-zinc-500">No product videos uploaded.</p>}
            {(formData.videos || []).map((video: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <ImageUpload
                    label={`Video ${index + 1}`}
                    value={video.url || ''}
                    folder="product-videos"
                    accept="video"
                    onChange={(url) => updateVideo(index, 'url', url)}
                  />
                  <Input label="Video title" value={video.title || ''} onChange={(value) => updateVideo(index, 'title', value)} />
                </div>
                <button onClick={() => setFormData({ ...formData, videos: formData.videos.filter((_: any, i: number) => i !== index) })} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={() => setFormData({ ...formData, videos: [...(formData.videos || []), { url: '', title: '', isPrimary: (formData.videos || []).length === 0 }] })} className="flex items-center gap-2 text-sm font-bold text-amber-600">
              <Plus className="h-4 w-4" />
              Add video
            </button>
          </Panel>

          <Panel title="Variants" className={activeProductTab !== 'variants' ? 'hidden' : ''}>
            {formData.variants.map((variant: any, index: number) => (
              <div key={variant._id || index} className="flex flex-col gap-3 border-b border-zinc-100 pb-3 last:border-0 sm:flex-row sm:items-end">
                <div className="grid flex-1 gap-3 md:grid-cols-6">
                  <Input label="Size" value={variant.size || ''} onChange={(value) => updateVariant(index, 'size', value)} />
                  <Input label="Color" value={variant.color || ''} onChange={(value) => updateVariant(index, 'color', value)} />
                  <Input label="SKU" value={variant.sku || ''} onChange={(value) => updateVariant(index, 'sku', value)} />
                  <Input label="Barcode" value={variant.barcode || ''} onChange={(value) => updateVariant(index, 'barcode', value)} />
                  <Input label="Stock" type="number" value={variant.stock || 0} onChange={(value) => updateVariant(index, 'stock', Number(value))} />
                  <Input label="Extra add-on" type="number" value={variant.extraPrice || 0} onChange={(value) => updateVariant(index, 'extraPrice', Number(value))} />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, variants: formData.variants.filter((_: any, i: number) => i !== index) })}
                  className="mb-0.5 rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10 sm:self-end"
                  title="Delete Variant"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button onClick={() => setFormData({ ...formData, variants: [...formData.variants, { size: '', color: '', stock: 0, extraPrice: 0, sku: '', barcode: '' }] })} className="flex items-center gap-2 text-sm font-bold text-amber-600">
              <Plus className="h-4 w-4" />
              Add variant
            </button>
          </Panel>

        </section>

        <section className="space-y-3 lg:sticky lg:top-16 lg:self-start">
          <Panel title="Organization">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Status</span>
              <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-amber-500">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Category</span>
              <select value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-amber-500">
                {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
            </label>
            <div>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Collections</span>
              {collections.length === 0 ? (
                <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">No collections found.</p>
              ) : (
                <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                  {collections.map((collection) => {
                    const collectionId = collection._id;
                    const checked = (formData.collections || []).includes(collectionId);
                    return (
                      <label key={collectionId} className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition ${checked ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' : 'text-zinc-600 hover:bg-white'}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleCollection(collectionId)} className="h-4 w-4 accent-amber-500" />
                        <span className="min-w-0 flex-1 truncate">{collection.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="mt-1 text-xs text-zinc-500">{(formData.collections || []).length} selected</p>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Audience</span>
              <select value={formData.gender || 'unisex'} onChange={(event) => setFormData({ ...formData, gender: event.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-amber-500">
                <option value="unisex">Unisex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </Panel>

          <details className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-zinc-500">Product Highlight Strip</h2>
                <p className="mt-1 text-xs text-zinc-500">Product page par icon strip me dikhega.</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-500">Open</span>
            </summary>
            <div className="mt-3 space-y-3">
            {(formData.productHighlights || []).map((highlight: any, index: number) => (
              <div key={highlight._id || index} className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex gap-2">
                  <select
                    value={highlight.icon || 'shirt'}
                    onChange={(event) => updateHighlight(index, 'icon', event.target.value)}
                    className="h-10 w-32 rounded-lg border border-zinc-200 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-amber-500"
                  >
                    {highlightIconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, productHighlights: (formData.productHighlights || []).filter((_: any, i: number) => i !== index) })}
                    className="ml-auto rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Input label="Title" value={highlight.title || ''} onChange={(value) => updateHighlight(index, 'title', value)} />
                <Input label="Subtitle" value={highlight.subtitle || ''} onChange={(value) => updateHighlight(index, 'subtitle', value)} />
              </div>
            ))}
            <button
              onClick={() => setFormData({ ...formData, productHighlights: [...(formData.productHighlights || []), { icon: 'sparkles', title: '', subtitle: '' }] })}
              className="flex items-center gap-2 text-sm font-bold text-amber-600"
            >
              <Plus className="h-4 w-4" />
              Add highlight
            </button>
            </div>
          </details>

          <Panel title="Pricing">
            <Input label="MRP / Compare-at Price" type="number" value={formData.basePrice || 0} onChange={(value) => setFormData({ ...formData, basePrice: Number(value) })} />
            <Input label="Selling Price" type="number" value={formData.salePrice || 0} onChange={(value) => setFormData({ ...formData, salePrice: Number(value) })} />
            <Input label="Cost Price / Landed Cost" type="number" value={formData.costPrice || 0} onChange={(value) => setFormData({ ...formData, costPrice: Number(value) })} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Extra Discount</span>
              <select value={formData.discountType || 'none'} onChange={(event) => setFormData({ ...formData, discountType: event.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-amber-500">
                <option value="none">None</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </label>
            <Input label="Discount Value" type="number" value={formData.discountValue || 0} onChange={(value) => setFormData({ ...formData, discountValue: Number(value) })} />
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
              <div className="flex justify-between text-zinc-600"><span>Final selling price</span><strong className="text-zinc-950">₹{finalSellingPrice.toLocaleString('en-IN')}</strong></div>
              <div className="mt-2 flex justify-between text-zinc-600"><span>Total customer discount</span><strong>{discountPercent}% / ₹{totalDiscount.toLocaleString('en-IN')}</strong></div>
              <div className="mt-2 flex justify-between text-zinc-600"><span>Profit after cost</span><strong className={profit >= 0 ? 'text-green-600' : 'text-red-500'}>₹{profit.toLocaleString('en-IN')} ({marginPercent}%)</strong></div>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return <div className={`${className} space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm`}><h2 className="text-sm font-bold uppercase tracking-[0.08em] text-zinc-500">{title}</h2>{children}</div>;
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-amber-500" />
    </label>
  );
}
