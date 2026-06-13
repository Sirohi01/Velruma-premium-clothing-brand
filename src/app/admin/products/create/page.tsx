'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
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

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    collections: [] as string[],
    brand: 'VELRUMA',
    gender: 'unisex',
    status: 'draft',
    basePrice: 0,
    salePrice: 0,
    costPrice: 0,
    discountType: 'none',
    discountValue: 0,
    images: [{ url: '', alt: '', isPrimary: true }],
    videos: [] as { url: string; title: string; isPrimary: boolean }[],
    variants: [{ size: '', color: '', stock: 0, extraPrice: 0, sku: '', barcode: '' }],
    productHighlights: defaultHighlights,
    productDetailsText: '',
    washCareText: '',
    deliveryReturnsText: '',
    seo: { title: '', description: '' },
  });

  const fetchData = async () => {
    try {
      const [catRes, colRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/collections')
      ]);
      const catData = await catRes.json();
      const colData = await colRes.json();
      
      if (catData.success) setCategories(catData.data);
      if (colData.success) setCollections(colData.data);
    } catch (error) {
      toast.error('Failed to load categories/collections');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: '', alt: '', isPrimary: false }]
    });
  };

  const handleAddVideo = () => {
    setFormData({
      ...formData,
      videos: [...formData.videos, { url: '', title: '', isPrimary: formData.videos.length === 0 }],
    });
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: '', color: '', stock: 0, extraPrice: 0, sku: '', barcode: '' }]
    });
  };

  const updateHighlight = (index: number, key: string, value: string) => {
    const productHighlights = [...formData.productHighlights];
    productHighlights[index] = { ...productHighlights[index], [key]: value };
    setFormData({ ...formData, productHighlights });
  };

  const toggleCollection = (collectionId: string) => {
    const exists = formData.collections.includes(collectionId);
    setFormData({
      ...formData,
      collections: exists
        ? formData.collections.filter((id) => id !== collectionId)
        : [...formData.collections, collectionId],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productDetails: formData.productDetailsText.split('\n').filter(Boolean),
          washCare: formData.washCareText.split('\n').filter(Boolean),
          deliveryReturns: formData.deliveryReturnsText.split('\n').filter(Boolean),
          slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        const firstSku = data.data?.variants?.[0]?.sku;
        toast.success(firstSku ? `Product created. SKU: ${firstSku}` : 'Product created successfully');
        router.push(`/admin/products/${data.data._id}`);
      } else {
        toast.error(data.error || 'Failed to create product');
      }
    } catch (error) {
      toast.error('Network error');
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
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="rounded-lg p-2 text-zinc-400 hover:bg-white hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Add New Product
            </h1>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400 shadow-lg shadow-amber-500/20"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Information */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">General Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="e.g. Premium Cotton Oversized T-Shirt"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Product Details (One point per line)</label>
                <textarea
                  rows={4}
                  value={formData.productDetailsText}
                  onChange={(e) => setFormData({ ...formData, productDetailsText: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Premium heavyweight cotton fabric&#10;Ribbed crew neck&#10;Dropped shoulders for a relaxed fit"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Wash Care (One point per line)</label>
                <textarea
                  rows={4}
                  value={formData.washCareText}
                  onChange={(e) => setFormData({ ...formData, washCareText: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Machine wash cold&#10;Do not bleach&#10;Tumble dry low"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Delivery & Returns (One point per line)</label>
                <textarea
                  rows={4}
                  value={formData.deliveryReturnsText}
                  onChange={(e) => setFormData({ ...formData, deliveryReturnsText: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Orders are dispatched within 24-48 hours.&#10;Delivery takes 3-7 business days.&#10;7-day hassle-free return/exchange policy."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Media</h2>
              <button type="button" onClick={handleAddImage} className="text-sm font-medium text-amber-600 dark:text-amber-500">
                + Add Image
              </button>
            </div>
            <div className="space-y-3">
              {formData.images.map((img, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-1">
                    <ImageUpload
                      label={index === 0 ? 'Primary image' : `Image ${index + 1}`}
                      value={img.url}
                      folder="products"
                      onChange={(url) => {
                        const newImgs = [...formData.images];
                        newImgs[index].url = url;
                        setFormData({ ...formData, images: newImgs });
                      }}
                    />
                    <input
                      value={img.alt || ''}
                      onChange={(e) => {
                        const newImgs = [...formData.images];
                        newImgs[index].alt = e.target.value;
                        setFormData({ ...formData, images: newImgs });
                      }}
                      placeholder="Image alt text for SEO"
                      className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  {index > 0 && (
                    <button type="button" onClick={() => {
                      const newImgs = formData.images.filter((_, i) => i !== index);
                      setFormData({ ...formData, images: newImgs });
                    }} className="mt-7 rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Product Videos</h2>
              <button type="button" onClick={handleAddVideo} className="text-sm font-medium text-amber-600 dark:text-amber-500">
                + Add Video
              </button>
            </div>
            {formData.videos.length === 0 ? (
              <p className="text-sm text-zinc-500">Upload fit videos, fabric videos, or product reels.</p>
            ) : (
              <div className="space-y-4">
                {formData.videos.map((video, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <ImageUpload
                        label={`Video ${index + 1}`}
                        value={video.url}
                        folder="product-videos"
                        accept="video"
                        onChange={(url) => {
                          const videos = [...formData.videos];
                          videos[index].url = url;
                          setFormData({ ...formData, videos });
                        }}
                      />
                      <input
                        value={video.title}
                        onChange={(e) => {
                          const videos = [...formData.videos];
                          videos[index].title = e.target.value;
                          setFormData({ ...formData, videos });
                        }}
                        placeholder="Video title"
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <button type="button" onClick={() => setFormData({ ...formData, videos: formData.videos.filter((_, i) => i !== index) })} className="mt-7 rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Variants (Size/Color)</h2>
              <button type="button" onClick={handleAddVariant} className="text-sm font-medium text-amber-600 dark:text-amber-500">
                + Add Variant
              </button>
            </div>
            <div className="space-y-4">
              {formData.variants.map((v, index) => (
                <div key={index} className="grid grid-cols-6 gap-3 items-end border-b border-zinc-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="col-span-1">
                    <label className="mb-1 block text-xs text-zinc-500">Size</label>
                    <input type="text" placeholder="L" value={v.size} onChange={(e) => {
                      const newVars = [...formData.variants];
                      newVars[index].size = e.target.value;
                      setFormData({ ...formData, variants: newVars });
                    }} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-xs text-zinc-500">Barcode</label>
                    <input type="text" placeholder="Auto from SKU" value={v.barcode || ''} onChange={(e) => {
                      const newVars = [...formData.variants];
                      newVars[index].barcode = e.target.value;
                      setFormData({ ...formData, variants: newVars });
                    }} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-xs text-zinc-500">Color</label>
                    <input type="text" placeholder="Black" value={v.color} onChange={(e) => {
                      const newVars = [...formData.variants];
                      newVars[index].color = e.target.value;
                      setFormData({ ...formData, variants: newVars });
                    }} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-xs text-zinc-500">Stock</label>
                    <input type="number" min="0" value={v.stock} onChange={(e) => {
                      const newVars = [...formData.variants];
                      newVars[index].stock = Number(e.target.value);
                      setFormData({ ...formData, variants: newVars });
                    }} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-xs text-zinc-500">Extra add-on</label>
                    <input type="number" min="0" value={v.extraPrice} onChange={(e) => {
                      const newVars = [...formData.variants];
                      newVars[index].extraPrice = Number(e.target.value);
                      setFormData({ ...formData, variants: newVars });
                    }} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                  <div className="col-span-1 flex justify-end pb-1">
                    {index > 0 && (
                      <button type="button" onClick={() => {
                        const newVars = formData.variants.filter((_, i) => i !== index);
                        setFormData({ ...formData, variants: newVars });
                      }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Status & Organization */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Collections</label>
              {collections.length === 0 ? (
                <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-white/10 dark:bg-white/5">No collections found. Create collections first.</p>
              ) : (
                <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-white/5">
                  {collections.map((collection) => {
                    const checked = formData.collections.includes(collection._id);
                    return (
                      <label key={collection._id} className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition ${checked ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300' : 'text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-white/10'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCollection(collection._id)}
                          className="h-4 w-4 accent-amber-600"
                        />
                        <span className="min-w-0 flex-1 truncate">{collection.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="mt-1 text-xs text-zinc-500">{formData.collections.length} selected</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Audience</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="unisex">Unisex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Product Highlight Strip</h2>
                <p className="mt-1 text-xs text-zinc-500">Product page par icon strip me dikhega.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, productHighlights: [...formData.productHighlights, { icon: 'sparkles', title: '', subtitle: '' }] })}
                className="shrink-0 text-sm font-medium text-amber-600 dark:text-amber-500"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {formData.productHighlights.map((highlight, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="flex gap-2">
                    <select
                      value={highlight.icon}
                      onChange={(e) => updateHighlight(index, 'icon', e.target.value)}
                      className="h-10 w-32 rounded-lg border border-zinc-200 bg-white px-2 text-sm dark:border-white/10 dark:bg-zinc-950 dark:text-white"
                    >
                      {highlightIconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, productHighlights: formData.productHighlights.filter((_, i) => i !== index) })}
                      className="ml-auto rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    value={highlight.title}
                    onChange={(e) => updateHighlight(index, 'title', e.target.value)}
                    placeholder="PREMIUM COTTON"
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950 dark:text-white"
                  />
                  <input
                    value={highlight.subtitle}
                    onChange={(e) => updateHighlight(index, 'subtitle', e.target.value)}
                    placeholder="240 GSM Fabric"
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Pricing</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Base Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Compare at Price (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Cost per item (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Optional"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Extra Discount</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <option value="none">None</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Discount Value</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-300"><span>Final selling price</span><strong className="text-zinc-900 dark:text-white">₹{finalSellingPrice.toLocaleString('en-IN')}</strong></div>
              <div className="mt-2 flex justify-between text-zinc-600 dark:text-zinc-300"><span>Total customer discount</span><strong>{discountPercent}% / ₹{totalDiscount.toLocaleString('en-IN')}</strong></div>
              <div className="mt-2 flex justify-between text-zinc-600 dark:text-zinc-300"><span>Profit after cost</span><strong className={profit >= 0 ? 'text-green-600' : 'text-red-500'}>₹{profit.toLocaleString('en-IN')} ({marginPercent}%)</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
