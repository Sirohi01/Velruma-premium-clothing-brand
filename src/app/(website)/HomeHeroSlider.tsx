'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

type TextStyle = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
};

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
  badgeStyle?: TextStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
};

function responsiveTextStyle(style?: TextStyle) {
  return {
    fontFamily: style?.fontFamily,
    fontWeight: style?.fontWeight,
    fontStyle: style?.fontStyle,
    color: style?.color,
    fontSize: style?.fontSize ? `min(${style.fontSize}, 12vw)` : undefined,
  };
}

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
      className="relative w-full overflow-hidden bg-[#F7F4EF]"
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
      <div className="absolute inset-0 hidden bg-gradient-to-r from-white/88 via-white/48 to-white/8 sm:block" />
      <div className="relative mx-auto hidden h-full max-w-7xl items-center px-4 py-3 sm:flex sm:py-6 lg:px-8">
        <div className="max-w-[16.5rem] sm:max-w-2xl">
          {active.badge && (
            <span className="inline-flex rounded-full border border-amber-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 shadow-sm" style={responsiveTextStyle(active.badgeStyle)}>
              {active.badge}
            </span>
          )}
          <h1 className="mt-2 text-[clamp(1.85rem,9vw,2.35rem)] font-semibold leading-[0.92] tracking-tight text-zinc-950 sm:mt-4 sm:text-6xl" style={{ ...responsiveTextStyle(active.titleStyle), fontFamily: active.titleStyle?.fontFamily || "'Playfair Display', serif" }}>
            {active.title}
          </h1>
          <p className="mt-2 line-clamp-3 max-w-xl text-xs leading-5 text-zinc-700 sm:mt-4 sm:line-clamp-none sm:text-base sm:leading-7" style={responsiveTextStyle(active.subtitleStyle)}>{active.subtitle}</p>
          <Link href={active.ctaHref || '/shop'} className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-xs font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:bg-amber-600 sm:mt-6 sm:h-11 sm:px-6 sm:text-sm">
            {active.ctaLabel || 'Shop Now'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-2 sm:bottom-6 sm:right-6">
          <button onClick={() => setIndex((index - 1 + slides.length) % slides.length)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-sm sm:h-10 sm:w-10">
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button onClick={() => setIndex((index + 1) % slides.length)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-sm sm:h-10 sm:w-10">
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      )}
    </section>
  );
}
