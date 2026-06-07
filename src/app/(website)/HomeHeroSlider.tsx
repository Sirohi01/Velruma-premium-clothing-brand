'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export type HeroSlide = {
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  badge?: string;
  aspectRatio?: string;
  objectPosition?: string;
  imageFit?: 'cover' | 'contain';
};

export default function HomeHeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const active = slides[index] || slides[0];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!active) return null;

  return (
    <section
      className="relative w-full max-h-[560px] min-h-[360px] overflow-hidden bg-[#F7F4EF]"
      style={{ aspectRatio: active.aspectRatio || '16 / 5' }}
    >
      {active.image ? (
        <>
          {(active.imageFit || 'cover') === 'contain' && (
            <img
              src={active.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-25 blur-xl"
              style={{ objectPosition: active.objectPosition || 'center' }}
            />
          )}
          <img
            src={active.image}
            alt={active.title}
            className="absolute inset-0 h-full w-full"
            style={{
              objectFit: active.imageFit || 'cover',
              objectPosition: active.objectPosition || 'center',
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#f7f4ef,#efe2cc,#d9e6df)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/48 to-white/8" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 py-6 lg:px-8">
        <div className="max-w-2xl">
          {active.badge && (
            <span className="inline-flex rounded-full border border-amber-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 shadow-sm">
              {active.badge}
            </span>
          )}
          <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-tight text-zinc-950 sm:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            {active.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600">{active.subtitle}</p>
          <Link href={active.ctaHref || '/shop'} className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-950 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:bg-amber-600">
            {active.ctaLabel || 'Shop Now'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-2">
          <button onClick={() => setIndex((index - 1 + slides.length) % slides.length)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setIndex((index + 1) % slides.length)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-sm">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}
