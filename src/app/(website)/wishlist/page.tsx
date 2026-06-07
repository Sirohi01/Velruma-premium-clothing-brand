'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem('velruma-wishlist') || '[]'));
    } catch {
      setItems([]);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-12 text-zinc-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>Wishlist</h1>
        <p className="mt-2 text-sm text-zinc-500">Your saved VELRUMA products.</p>
        {items.length === 0 ? (
          <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-12 text-center">
            <Heart className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-4 text-zinc-600">No wishlist items yet.</p>
            <Link href="/shop" className="mt-5 inline-block rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white">Browse Shop</Link>
          </section>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {items.map((item) => (
              <Link key={item.productId || item._id || item.slug} href={`/product/${item.slug}`} className="rounded-xl bg-white p-3 shadow-sm">
                {item.image && <img src={item.image} alt={item.name || item.title} className="aspect-[3/4] w-full rounded-lg object-cover" />}
                <p className="mt-3 text-sm font-medium">{item.name || item.title}</p>
                <p className="text-xs text-zinc-500">Rs.{Number(item.price || 0).toLocaleString('en-IN')}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
