'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface Image {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface Video {
  url: string;
  title?: string;
  isPrimary?: boolean;
}

interface MediaGalleryProps {
  images: Image[];
  videos?: Video[];
  title: string;
}

export default function MediaGallery({ images, videos = [], title }: MediaGalleryProps) {
  const allMedia = [
    ...images.map(img => ({ type: 'image' as const, url: img.url, alt: img.alt || title })),
    ...videos.map(vid => ({ type: 'video' as const, url: vid.url, title: vid.title || title }))
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  if (allMedia.length === 0) {
    return (
      <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-100 flex items-center justify-center">
        <span className="text-zinc-400">No image</span>
      </div>
    );
  }

  const activeMedia = allMedia[activeIndex];

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-3 overflow-x-auto lg:flex-col lg:w-20 lg:shrink-0 pb-2 lg:pb-0 scrollbar-hide">
          {allMedia.map((media, idx) => (
            <button
              key={`${media.url}-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 flex items-center justify-center transition-all ${
                activeIndex === idx ? 'ring-2 ring-zinc-900 ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {media.type === 'image' ? (
                <img src={media.url} alt={media.alt} className="h-full w-full object-cover object-center" />
              ) : (
                <div className="relative h-full w-full flex items-center justify-center bg-zinc-200 text-zinc-500">
                  <Play className="h-6 w-6" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Media */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-100">
        {activeMedia.type === 'image' ? (
          <img
            src={activeMedia.url}
            alt={activeMedia.alt}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <video
            src={activeMedia.url}
            controls
            className="h-full w-full object-cover object-center"
          />
        )}
      </div>
    </div>
  );
}
