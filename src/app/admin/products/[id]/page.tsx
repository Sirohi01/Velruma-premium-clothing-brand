'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingState from '@/components/shared/LoadingState';
import ImageUpload from '@/components/shared/ImageUpload';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(null);

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
            variants: product.variants?.length ? product.variants : [{ size: '', color: '', stock: 0, extraPrice: 0, sku: '' }],
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

  const save = async () => {
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
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            <p className="text-sm text-zinc-500">{formData.title}</p>
          </div>
        </div>
        <button onClick={save} className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400">
          <Save className="h-4 w-4" />
          Save
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-5 lg:col-span-2">
          <Panel title="General">
            <Input label="Title" value={formData.title} onChange={(value) => setFormData({ ...formData, title: value })} />
            <Input label="Slug" value={formData.slug} onChange={(value) => setFormData({ ...formData, slug: value })} />
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-300">Description</span>
              <textarea value={formData.description || ''} onChange={(event) => setFormData({ ...formData, description: event.target.value })} rows={5} className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-amber-500" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-300">Product Details (One point per line)</span>
              <textarea value={formData.productDetailsText || ''} onChange={(event) => setFormData({ ...formData, productDetailsText: event.target.value })} rows={4} className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-amber-500" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-300">Wash Care (One point per line)</span>
              <textarea value={formData.washCareText || ''} onChange={(event) => setFormData({ ...formData, washCareText: event.target.value })} rows={4} className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-amber-500" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-300">Delivery & Returns (One point per line)</span>
              <textarea value={formData.deliveryReturnsText || ''} onChange={(event) => setFormData({ ...formData, deliveryReturnsText: event.target.value })} rows={4} className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-amber-500" />
            </label>
          </Panel>

          <Panel title="Media">
            {formData.images.map((image: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-1">
                  <ImageUpload
                    label={index === 0 ? 'Primary image' : `Image ${index + 1}`}
                    value={image.url || ''}
                    folder="products"
                    onChange={(url) => updateImage(index, 'url', url)}
                  />
                </div>
                <button onClick={() => setFormData({ ...formData, images: formData.images.filter((_: any, i: number) => i !== index) })} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={() => setFormData({ ...formData, images: [...formData.images, { url: '', alt: '', isPrimary: false }] })} className="flex items-center gap-2 text-sm font-medium text-amber-400">
              <Plus className="h-4 w-4" />
              Add image
            </button>
          </Panel>

          <Panel title="Product Videos">
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
            <button onClick={() => setFormData({ ...formData, videos: [...(formData.videos || []), { url: '', title: '', isPrimary: (formData.videos || []).length === 0 }] })} className="flex items-center gap-2 text-sm font-medium text-amber-400">
              <Plus className="h-4 w-4" />
              Add video
            </button>
          </Panel>

          <Panel title="Variants">
            {formData.variants.map((variant: any, index: number) => (
              <div key={variant._id || index} className="grid gap-3 border-b border-white/5 pb-4 last:border-0 md:grid-cols-5">
                <Input label="Size" value={variant.size || ''} onChange={(value) => updateVariant(index, 'size', value)} />
                <Input label="Color" value={variant.color || ''} onChange={(value) => updateVariant(index, 'color', value)} />
                <Input label="SKU" value={variant.sku || ''} onChange={(value) => updateVariant(index, 'sku', value)} />
                <Input label="Stock" type="number" value={variant.stock || 0} onChange={(value) => updateVariant(index, 'stock', Number(value))} />
                <Input label="+ Price" type="number" value={variant.extraPrice || 0} onChange={(value) => updateVariant(index, 'extraPrice', Number(value))} />
              </div>
            ))}
            <button onClick={() => setFormData({ ...formData, variants: [...formData.variants, { size: '', color: '', stock: 0, extraPrice: 0, sku: '' }] })} className="flex items-center gap-2 text-sm font-medium text-amber-400">
              <Plus className="h-4 w-4" />
              Add variant
            </button>
          </Panel>
        </section>

        <section className="space-y-5">
          <Panel title="Organization">
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-300">Status</span>
              <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-300">Category</span>
              <select value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white">
                {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-300">Audience</span>
              <select value={formData.gender || 'unisex'} onChange={(event) => setFormData({ ...formData, gender: event.target.value })} className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white">
                <option value="unisex">Unisex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </Panel>

          <Panel title="Pricing">
            <Input label="MRP / Compare-at Price" type="number" value={formData.basePrice || 0} onChange={(value) => setFormData({ ...formData, basePrice: Number(value) })} />
            <Input label="Selling Price" type="number" value={formData.salePrice || 0} onChange={(value) => setFormData({ ...formData, salePrice: Number(value) })} />
            <Input label="Cost Price / Landed Cost" type="number" value={formData.costPrice || 0} onChange={(value) => setFormData({ ...formData, costPrice: Number(value) })} />
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-300">Extra Discount</span>
              <select value={formData.discountType || 'none'} onChange={(event) => setFormData({ ...formData, discountType: event.target.value })} className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white">
                <option value="none">None</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </label>
            <Input label="Discount Value" type="number" value={formData.discountValue || 0} onChange={(value) => setFormData({ ...formData, discountValue: Number(value) })} />
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
              <div className="flex justify-between text-zinc-300"><span>Final selling price</span><strong className="text-white">₹{finalSellingPrice.toLocaleString('en-IN')}</strong></div>
              <div className="mt-2 flex justify-between text-zinc-300"><span>Total customer discount</span><strong>{discountPercent}% / ₹{totalDiscount.toLocaleString('en-IN')}</strong></div>
              <div className="mt-2 flex justify-between text-zinc-300"><span>Profit after cost</span><strong className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>₹{profit.toLocaleString('en-IN')} ({marginPercent}%)</strong></div>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-4 rounded-xl border border-white/10 bg-zinc-900 p-5"><h2 className="text-sm font-semibold text-white">{title}</h2>{children}</div>;
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-300">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500" />
    </label>
  );
}
