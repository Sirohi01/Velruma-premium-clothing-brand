'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

type Slide = { title: string; subtitle: string; image: string; ctaLabel: string; ctaHref: string; badge: string; aspectRatio: string; objectPosition: string; imageFit: 'cover' | 'contain' };

const emptySlide: Slide = { title: '', subtitle: '', image: '', ctaLabel: 'Shop Now', ctaHref: '/shop', badge: '', aspectRatio: '16 / 5', objectPosition: 'center', imageFit: 'cover' };

export default function HomepageManagerPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [setting, setSetting] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    fetch('/api/settings?group=homepage')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        const item = data.data.find((entry: any) => entry.key === 'home_hero_slides') || null;
        setSetting(item);
        try {
          setSlides(JSON.parse(item?.value || '[]'));
          setParseError(false);
        } catch {
          setParseError(true);
          toast.error('Homepage slides data is invalid. Please repair before saving.');
        }
      });
  }, []);

  const updateSlide = (index: number, patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((slide, itemIndex) => itemIndex === index ? { ...slide, ...patch } : slide));
  };

  const persistSlides = async (slidesToSave: Slide[], successMessage = 'Homepage saved successfully') => {
    setSaving(true);
    const savingToast = toast.loading('Saving homepage...');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'homepage',
          key: 'home_hero_slides',
          label: 'Homepage Hero Slides',
          type: 'textarea',
          isPublic: true,
          value: JSON.stringify(slidesToSave),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSetting(data.data?.[0] || setting);
        toast.success(successMessage, { id: savingToast });
      } else {
        toast.error(data.error || 'Homepage save failed', { id: savingToast });
      }
    } catch {
      toast.error('Network error while saving homepage', { id: savingToast });
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (parseError) {
      toast.error('Homepage slides data is invalid. Refresh after repair before saving.');
      return;
    }
    await persistSlides(slides);
  };

  const removeSlide = async (index: number) => {
    const nextSlides = slides.filter((_, itemIndex) => itemIndex !== index);
    setSlides(nextSlides);
    await persistSlides(nextSlides, 'Slide removed and saved');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Homepage Manager</h1>
          <p className="text-sm text-zinc-500">Manage hero sliders shown on the website homepage.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSlides([...slides, emptySlide])} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200">
            <Plus className="h-4 w-4" />
            Add Slide
          </button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Best homepage hero export size: <strong>1920 x 600 px</strong> or <strong>1600 x 500 px</strong>. Select <strong>16:5 Banner</strong> + <strong>Cover</strong> for a clean full-width hero. Use <strong>Contain</strong> only when the full image must show with no crop.
      </div>

      {parseError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Saved homepage slider JSON is invalid. Do not save from this screen until the data is repaired.
        </div>
      )}

      <div className="grid gap-3">
        {slides.map((slide, index) => (
          <section key={index} className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm lg:grid-cols-[380px_1fr]">
            <div>
              <ImageUpload value={slide.image} onChange={(image) => updateSlide(index, { image })} label={`Slide ${index + 1} Image`} folder="homepage" accept="image" />
              <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50" style={{ aspectRatio: slide.aspectRatio || '16 / 5' }}>
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt=""
                    className="h-full w-full"
                    style={{
                      objectFit: slide.imageFit || 'cover',
                      objectPosition: slide.objectPosition || 'center',
                    }}
                  />
                ) : <div className="flex h-full items-center justify-center text-xs text-zinc-400">Aspect preview</div>}
              </div>
              <p className="mt-2 text-xs text-zinc-500">Preview ratio: {slide.aspectRatio === '16 / 5' ? '16:5 / 1920x600 recommended' : slide.aspectRatio?.replace(' / ', ':') || '16:5'}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Badge" value={slide.badge} onChange={(badge) => updateSlide(index, { badge })} />
              <Input label="CTA Label" value={slide.ctaLabel} onChange={(ctaLabel) => updateSlide(index, { ctaLabel })} />
              <Input label="Title" value={slide.title} onChange={(title) => updateSlide(index, { title })} />
              <Input label="CTA Link" value={slide.ctaHref} onChange={(ctaHref) => updateSlide(index, { ctaHref })} />
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase text-zinc-500">Aspect Ratio</span>
                <select value={slide.aspectRatio || '16 / 5'} onChange={(event) => updateSlide(index, { aspectRatio: event.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500">
                  <option value="16 / 5">16:5 Banner - 1920x600 recommended</option>
                  <option value="3 / 1">3:1 Slim Banner - 1800x600</option>
                  <option value="16 / 9">16:9 Wide - video/photo</option>
                  <option value="21 / 9">21:9 Cinematic</option>
                  <option value="4 / 3">4:3 Classic</option>
                  <option value="3 / 2">3:2 Editorial</option>
                  <option value="1 / 1">1:1 Square</option>
                  <option value="4 / 5">4:5 Portrait</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase text-zinc-500">Image Position</span>
                <select value={slide.objectPosition || 'center'} onChange={(event) => updateSlide(index, { objectPosition: event.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500">
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase text-zinc-500">Image Fit</span>
                <select value={slide.imageFit || 'contain'} onChange={(event) => updateSlide(index, { imageFit: event.target.value as 'cover' | 'contain' })} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500">
                  <option value="contain">Contain - full image, no crop</option>
                  <option value="cover">Cover - fills area, may crop</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase text-zinc-500">Subtitle</span>
                <textarea value={slide.subtitle} onChange={(event) => updateSlide(index, { subtitle: event.target.value })} rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
              </label>
              <div className="flex justify-end md:col-span-2">
                <button type="button" onClick={() => removeSlide(index)} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60">
                  <Trash2 className="h-4 w-4" />
                  {saving ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase text-zinc-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-500" />
    </label>
  );
}
