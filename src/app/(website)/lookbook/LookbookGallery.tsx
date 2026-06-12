'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, ImageIcon, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WebsiteLookbookItem = {
  id: string;
  title: string;
  caption: string;
  type: 'photo' | 'video' | 'instagram';
  mediaUrl: string;
  instagramUrl: string;
  thumbnailUrl: string;
  alt: string;
  category: string;
  season: string;
  tags: string[];
  sortOrder: number;
  isFeatured: boolean;
};

const typeFilters = [
  { key: 'all', label: 'All' },
  { key: 'photo', label: 'Photos' },
  { key: 'video', label: 'Videos' },
  { key: 'instagram', label: 'Instagram' },
] as const;

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function InstagramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.8" cy="7.2" r="1" fill="currentColor" />
    </svg>
  );
}

function getMediaUrl(item: WebsiteLookbookItem) {
  if (item.type === 'video') return item.thumbnailUrl || item.mediaUrl;
  return item.type === 'instagram' ? item.thumbnailUrl : item.mediaUrl;
}

export default function LookbookGallery({ items }: { items: WebsiteLookbookItem[] }) {
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]['key']>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [preview, setPreview] = useState<WebsiteLookbookItem | null>(null);

  const categories = useMemo(() => unique(items.map((item) => item.category)), [items]);
  const seasons = useMemo(() => unique(items.map((item) => item.season)), [items]);
  const featuredItem = useMemo(() => items.find((item) => item.isFeatured) || items[0], [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const typeMatch = typeFilter === 'all' || item.type === typeFilter;
      const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
      const seasonMatch = seasonFilter === 'all' || item.season === seasonFilter;
      return typeMatch && categoryMatch && seasonMatch;
    });
  }, [categoryFilter, items, seasonFilter, typeFilter]);

  useEffect(() => {
    if (!preview) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [preview]);

  return (
    <main className="bg-[#f8f5ef] text-zinc-950">
      <section className="border-b border-zinc-200/80 bg-[#fbfaf7]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 sm:py-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">VELRUMA Visual Diary</span>
            <h1 className="mt-2 font-serif text-4xl font-semibold leading-none text-zinc-950 sm:text-6xl">
              Lookbook
            </h1>
            <p className="mt-3 text-base leading-7 text-zinc-600">
              Campaign frames, product styling, social drops, and short videos curated into one clean visual gallery.
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Explore how VELRUMA oversized essentials move across studio edits, streetwear styling, launch moments, and real social posts.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                {items.length} visuals
              </span>
              {categories.slice(0, 2).map((category) => (
                <span key={category} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                  {category}
                </span>
              ))}
            </div>
            <div className="mt-3 grid max-w-xl grid-cols-3 gap-2">
              {[
                ['Photos', items.filter((item) => item.type === 'photo').length],
                ['Videos', items.filter((item) => item.type === 'video').length],
                ['Social', items.filter((item) => item.type === 'instagram').length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-zinc-200 bg-white/80 px-3 py-2 shadow-sm">
                  <p className="text-base font-semibold leading-none text-zinc-950">{value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex max-w-xl items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5 text-sm leading-6 text-amber-950">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
              <p>
                New campaign visuals are updated from the admin lookbook, so this page stays fresh with every product drop.
              </p>
            </div>
          </div>

          {featuredItem && getMediaUrl(featuredItem) && (
            <button
              type="button"
              onClick={() => featuredItem.type === 'instagram' ? window.open(featuredItem.instagramUrl, '_blank', 'noreferrer') : setPreview(featuredItem)}
              className="group relative hidden w-full max-w-[520px] justify-self-end overflow-hidden rounded-xl border border-zinc-200 bg-[#f1eee8] text-left shadow-sm lg:block"
            >
              {featuredItem.type === 'video' ? (
                featuredItem.thumbnailUrl ? (
                  <img src={featuredItem.thumbnailUrl} alt={featuredItem.alt} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                ) : (
                  <video src={featuredItem.mediaUrl} className="aspect-square w-full object-cover" muted playsInline preload="metadata" />
                )
              ) : (
                <img src={getMediaUrl(featuredItem)} alt={featuredItem.alt} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
              )}
              {featuredItem.type === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/5 transition group-hover:bg-black/15">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-zinc-950 shadow-lg">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Featured</p>
                <h2 className="mt-1 text-xl font-semibold">{featuredItem.title}</h2>
              </div>
            </button>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {typeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setTypeFilter(filter.key)}
                  className={cn(
                    'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition',
                    typeFilter === filter.key
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-amber-50 hover:text-zinc-950'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-700 outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={seasonFilter}
                onChange={(event) => setSeasonFilter(event.target.value)}
                className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-700 outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="all">All seasons</option>
                {seasons.map((season) => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="my-6 rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-12 text-center">
            <ImageIcon className="mx-auto h-9 w-9 text-zinc-400" />
            <h2 className="mt-4 text-xl font-semibold text-zinc-950">Lookbook is being curated</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Add published photos, videos, or Instagram cards from admin to make this gallery live.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 py-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => {
              const isFeatureCard = index === 0 && filteredItems.length > 3;
              return (
              <article
                key={item.id}
                className={cn(
                  'group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md',
                  isFeatureCard && 'xl:col-span-2'
                )}
              >
                {item.type === 'photo' && (
                  <button type="button" onClick={() => setPreview(item)} className="relative block w-full text-left">
                    <img
                      src={item.mediaUrl}
                      alt={item.alt}
                      className={cn(
                        'aspect-square w-full bg-[#f1eee8] object-contain transition duration-500 group-hover:scale-[1.01]'
                      )}
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900 shadow-sm">
                      View
                    </span>
                  </button>
                )}

                {item.type === 'video' && (
                  <button type="button" onClick={() => setPreview(item)} className="group relative block w-full text-left">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.alt}
                        className="aspect-square w-full bg-[#f1eee8] object-contain transition duration-500 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <video
                        src={item.mediaUrl}
                        className="aspect-square w-full bg-[#f1eee8] object-contain"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/5 transition group-hover:bg-black/15">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-zinc-950 shadow-lg">
                        <Play className="h-5 w-5 fill-current" />
                      </span>
                    </span>
                  </button>
                )}

                {item.type === 'instagram' && (
                  <Link
                    href={item.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group block"
                  >
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.alt}
                        className={cn(
                          'aspect-square w-full bg-[#f1eee8] object-contain transition duration-500 group-hover:scale-[1.01]'
                        )}
                      />
                    ) : (
                      <div className="flex aspect-square w-full flex-col items-center justify-center bg-[#f6efe3] px-6 text-center">
                        <InstagramMark className="h-10 w-10 text-zinc-900" />
                        <span className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Instagram Drop</span>
                        <span className="mt-2 text-lg font-semibold text-zinc-950">{item.title}</span>
                      </div>
                    )}
                  </Link>
                )}

                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                    <span>{item.type}</span>
                    {item.category && <span className="text-zinc-300">/</span>}
                    {item.category && <span>{item.category}</span>}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold leading-snug text-zinc-950">{item.title}</h2>
                    {item.caption && <p className="mt-1 text-sm leading-6 text-zinc-600">{item.caption}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.season && (
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">{item.season}</span>
                    )}
                    {item.isFeatured && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Featured</span>
                    )}
                    {item.type === 'instagram' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white">
                        Open <ExternalLink className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </section>

      {preview && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute right-4 top-4 rounded-full bg-white p-2 text-zinc-950 shadow-lg"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="grid max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-[1.15fr_0.85fr]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-[320px] items-center justify-center bg-[#f1eee8] lg:min-h-[620px]">
              {preview.type === 'video' ? (
                <video src={preview.mediaUrl} className="max-h-[88vh] w-full bg-black object-contain lg:max-h-[620px]" controls autoPlay playsInline />
              ) : (
                <img src={preview.mediaUrl} alt={preview.alt} className="max-h-[88vh] w-full object-contain lg:max-h-[620px]" />
              )}
            </div>

            <div className="flex max-h-[90vh] flex-col overflow-y-auto p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                <span>{preview.type}</span>
                {preview.category && <span className="text-zinc-300">/</span>}
                {preview.category && <span>{preview.category}</span>}
              </div>

              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
                {preview.title}
              </h2>
              {preview.caption && (
                <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
                  {preview.caption}
                </p>
              )}

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {preview.season && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Season</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">{preview.season}</p>
                  </div>
                )}
                {preview.isFeatured && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-600">Status</p>
                    <p className="mt-1 text-sm font-semibold text-amber-900">Featured visual</p>
                  </div>
                )}
              </div>

              {preview.tags.length > 0 && (
                <div className="mt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {preview.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="h-10 rounded-lg border border-zinc-200 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Close preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
