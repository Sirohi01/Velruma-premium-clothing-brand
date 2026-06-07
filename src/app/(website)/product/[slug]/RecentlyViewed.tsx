'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RecentlyViewed({ currentProduct }: { currentProduct: any }) {
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    // Read from local storage
    const stored = localStorage.getItem('velruma_recently_viewed');
    let history: any[] = stored ? JSON.parse(stored) : [];

    // Remove current product if exists
    history = history.filter(p => p._id !== currentProduct._id);
    
    // Set to state to render BEFORE adding current product (so we don't render current product in its own recently viewed)
    setRecent(history.slice(0, 4));

    // Add current product to the front of history
    history.unshift({
      _id: currentProduct._id,
      title: currentProduct.title,
      slug: currentProduct.slug,
      price: currentProduct.basePrice,
      image: currentProduct.images?.[0]?.url || ''
    });

    // Keep only last 10
    history = history.slice(0, 10);
    localStorage.setItem('velruma_recently_viewed', JSON.stringify(history));
  }, [currentProduct._id]);

  if (recent.length === 0) return null;

  return (
    <div className="mt-12 border-t border-zinc-200 pt-8">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900" style={{ fontFamily: "'Playfair Display', serif" }}>
        Recently Viewed
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:gap-x-8">
        {recent.map((rp) => (
          <Link key={rp._id} href={`/product/${rp.slug}`} className="group relative block overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] overflow-hidden bg-zinc-100">
              {rp.image ? (
                <img 
                  src={rp.image} 
                  alt={rp.title} 
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-400">
                  No Image
                </div>
              )}
            </div>
            <div className="p-4 text-center">
              <h3 className="text-sm font-medium text-zinc-900 line-clamp-1">{rp.title}</h3>
              <p className="mt-2 text-sm text-zinc-500">₹{rp.price?.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
