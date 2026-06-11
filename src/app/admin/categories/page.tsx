'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderPlus, AlertTriangle, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  
  const DEFAULT_SIZE_CHART = {
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    measurements: [
      { name: 'Length', values: ['', '', '', '', '', ''] },
      { name: 'Chest', values: ['', '', '', '', '', ''] },
      { name: 'Brand Size', values: ['', '', '', '', '', ''] },
      { name: 'Shoulder', values: ['', '', '', '', '', ''] },
      { name: 'Sleeve Length', values: ['', '', '', '', '', ''] },
    ]
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    imageAlt: '',
    sizeChartImage: '',
    sizeChartImageAlt: '',
    sizeChart: DEFAULT_SIZE_CHART,
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(editTarget ? `/api/categories/${editTarget._id}` : '/api/categories', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editTarget ? 'Category updated successfully' : 'Category created successfully');
        setIsModalOpen(false);
        setEditTarget(null);
        setFormData({ name: '', slug: '', description: '', image: '', imageAlt: '', sizeChartImage: '', sizeChartImageAlt: '', sizeChart: DEFAULT_SIZE_CHART, isActive: true, isFeatured: false });
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to create category');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const openCreateModal = () => {
    setEditTarget(null);
    setFormData({ name: '', slug: '', description: '', image: '', imageAlt: '', sizeChartImage: '', sizeChartImageAlt: '', sizeChart: DEFAULT_SIZE_CHART, isActive: true, isFeatured: false });
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditTarget(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image: category.image || '',
      imageAlt: category.imageAlt || '',
      sizeChartImage: category.sizeChartImage || '',
      sizeChartImageAlt: category.sizeChartImageAlt || '',
      sizeChart: (category.sizeChart && category.sizeChart.sizes && category.sizeChart.sizes.length > 0) 
        ? category.sizeChart 
        : DEFAULT_SIZE_CHART,
      isActive: category.isActive ?? true,
      isFeatured: category.isFeatured ?? false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Category deleted');
        setDeleteTarget(null);
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Categories
          </h1>
          <p className="text-sm text-zinc-500">Manage your product categories and hierarchy.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Category Name</th>
              <th className="px-6 py-4 font-medium">Image</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Featured</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading categories...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  <FolderPlus className="mx-auto mb-3 h-8 w-8 opacity-20" />
                  No categories found. Click Add Category to create one.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                    {category.name}
                  </td>
                  <td className="px-6 py-4">
                    {category.image ? (
                      <div className="h-14 w-20 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-white/5">
                        <img
                          src={category.image}
                          alt={category.imageAlt || `${category.name} category image`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-20 items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 text-xs text-zinc-400 dark:border-white/10 dark:bg-white/5">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{category.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-400'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {category.isFeatured ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                        Featured
                      </span>
                    ) : (
                      <span className="text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(category)}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
            <div className="p-6 border-b border-zinc-100 dark:border-white/10 shrink-0 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{editTarget ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="e.g. T-Shirts"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Slug</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-mono dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <ImageUpload label="Category image" value={formData.image} folder="categories" onChange={(image) => setFormData({ ...formData, image })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category image alt text</label>
                <input
                  value={formData.imageAlt}
                  onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Describe category image for SEO"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <ImageUpload label="Size chart image" value={formData.sizeChartImage} folder="categories/size-charts" onChange={(image) => setFormData({ ...formData, sizeChartImage: image })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Size chart image alt text</label>
                <input
                  value={formData.sizeChartImageAlt}
                  onChange={(e) => setFormData({ ...formData, sizeChartImageAlt: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Describe size chart image"
                />
              </div>
              
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Manual Size Chart</label>
                </div>
                <p className="text-xs text-zinc-500">Add columns (e.g., Chest, Length) and sizes (e.g., S, M, L) if you don't have an image.</p>
                
                <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-white/10 dark:bg-zinc-900/50">
                  {/* Sizes (Columns) */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Sizes (e.g., S, M, L)</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.sizeChart.sizes.map((size, idx) => (
                        <div key={idx} className="flex items-center gap-1 rounded-md bg-white border border-zinc-200 px-2 py-1 text-xs dark:bg-zinc-800 dark:border-white/10">
                          <span>{size}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              const newSizes = [...formData.sizeChart.sizes];
                              newSizes.splice(idx, 1);
                              const newMeasurements = formData.sizeChart.measurements.map(m => {
                                const vals = [...m.values];
                                vals.splice(idx, 1);
                                return { ...m, values: vals };
                              });
                              setFormData({ ...formData, sizeChart: { sizes: newSizes, measurements: newMeasurements } });
                            }}
                            className="text-zinc-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {isAddingColumn ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            placeholder="e.g. XL"
                            className="w-16 rounded border border-zinc-200 px-2 py-1 text-xs bg-white dark:border-white/10 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newColumnName.trim()) {
                                  setFormData({
                                    ...formData,
                                    sizeChart: {
                                      sizes: [...formData.sizeChart.sizes, newColumnName.trim()],
                                      measurements: formData.sizeChart.measurements.map(m => ({ ...m, values: [...m.values, ''] }))
                                    }
                                  });
                                }
                                setNewColumnName('');
                                setIsAddingColumn(false);
                              } else if (e.key === 'Escape') {
                                setNewColumnName('');
                                setIsAddingColumn(false);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                                if (newColumnName.trim()) {
                                  setFormData({
                                    ...formData,
                                    sizeChart: {
                                      sizes: [...formData.sizeChart.sizes, newColumnName.trim()],
                                      measurements: formData.sizeChart.measurements.map(m => ({ ...m, values: [...m.values, ''] }))
                                    }
                                  });
                                }
                                setNewColumnName('');
                                setIsAddingColumn(false);
                            }}
                            className="flex items-center justify-center rounded bg-zinc-900 p-1 text-white hover:bg-zinc-800"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                                setNewColumnName('');
                                setIsAddingColumn(false);
                            }}
                            className="flex items-center justify-center rounded bg-zinc-100 p-1 text-zinc-500 hover:bg-zinc-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddingColumn(true)}
                          className="flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-2 py-1 text-xs text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
                        >
                          <Plus className="h-3 w-3" /> Add Size
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Measurements (Rows) */}
                  {formData.sizeChart.sizes.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr>
                            <th className="pb-2 font-medium text-zinc-500">Measurement</th>
                            {formData.sizeChart.sizes.map((size, idx) => (
                              <th key={idx} className="pb-2 font-medium text-zinc-500">{size}</th>
                            ))}
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
                          {formData.sizeChart.measurements.map((m, mIdx) => (
                            <tr key={mIdx}>
                              <td className="py-2 pr-2">
                                <input
                                  type="text"
                                  value={m.name}
                                  placeholder="e.g. Chest"
                                  onChange={(e) => {
                                    const newMeasurements = [...formData.sizeChart.measurements];
                                    newMeasurements[mIdx].name = e.target.value;
                                    setFormData({ ...formData, sizeChart: { ...formData.sizeChart, measurements: newMeasurements } });
                                  }}
                                  className="w-24 rounded border border-zinc-200 px-2 py-1 bg-white dark:border-white/10 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </td>
                              {m.values.map((val, sIdx) => (
                                <td key={sIdx} className="py-2 pr-2">
                                  <input
                                    type="text"
                                    value={val}
                                    placeholder="in cm/in"
                                    onChange={(e) => {
                                      const newMeasurements = [...formData.sizeChart.measurements];
                                      newMeasurements[mIdx].values[sIdx] = e.target.value;
                                      setFormData({ ...formData, sizeChart: { ...formData.sizeChart, measurements: newMeasurements } });
                                    }}
                                    className="w-20 rounded border border-zinc-200 px-2 py-1 bg-white dark:border-white/10 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                </td>
                              ))}
                              <td className="py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newMeasurements = [...formData.sizeChart.measurements];
                                    newMeasurements.splice(mIdx, 1);
                                    setFormData({ ...formData, sizeChart: { ...formData.sizeChart, measurements: newMeasurements } });
                                  }}
                                  className="text-zinc-400 hover:text-red-500 p-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            sizeChart: {
                              ...formData.sizeChart,
                              measurements: [...formData.sizeChart.measurements, { name: '', values: Array(formData.sizeChart.sizes.length).fill('') }]
                            }
                          });
                        }}
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500"
                      >
                        <Plus className="h-3 w-3" /> Add Measurement Row
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-zinc-100 dark:border-white/10 pt-4 mt-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Active</label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 accent-amber-500"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Featured</label>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="h-4 w-4 accent-amber-500"
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 pt-4 border-t border-zinc-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditTarget(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400"
                >
                  {editTarget ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-red-500/10 bg-white shadow-2xl dark:bg-zinc-950">
            <div className="flex items-start justify-between border-b border-zinc-100 p-5 dark:border-white/10">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Delete category?</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    This will remove <span className="font-medium text-zinc-800 dark:text-zinc-200">{deleteTarget.name}</span> from your storefront categories.
                  </p>
                </div>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-zinc-50 p-5 dark:bg-zinc-900/70">
              <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{deleteTarget.name}</p>
                <p className="mt-1 font-mono text-xs text-zinc-500">{deleteTarget.slug}</p>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-white/10">
                  Keep Category
                </button>
                <button type="button" onClick={handleDelete} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 disabled:opacity-60">
                  {deleting ? 'Deleting...' : 'Delete Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
