import Link from 'next/link';
import { ArrowRight, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Collection from '@/models/Collection';
import Setting from '@/models/Setting';
import HomeHeroSlider, { type HeroSlide } from './HomeHeroSlider';

function price(product: any) {
  const base = Number(product.basePrice || 0);
  const sale = Number(product.salePrice || base);
  const discount = product.discountType === 'percentage'
    ? Math.round((sale * Number(product.discountValue || 0)) / 100)
    : product.discountType === 'fixed'
      ? Number(product.discountValue || 0)
      : 0;
  return Math.max(0, sale - discount);
}

function parseSlides(value: unknown): HeroSlide[] {
  try {
    if (typeof value === 'string' && value.trim()) return JSON.parse(value);
    if (Array.isArray(value)) return value as HeroSlide[];
  } catch {
    return [];
  }
  return [];
}

export default async function HomePage() {
  await dbConnect();
  const [products, categories, collections, heroSetting] = await Promise.all([
    Product.find({ status: 'active' }).sort({ createdAt: -1 }).limit(8).lean(),
    Category.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 }).limit(8).lean(),
    Collection.find({ isActive: true }).sort({ createdAt: -1 }).limit(3).lean(),
    Setting.findOne({ key: 'home_hero_slides' }).lean(),
  ]);

  const slides = parseSlides(heroSetting?.value);
  const fallbackSlides: HeroSlide[] = [
    {
      title: 'Premium Streetwear, Softer Than Ever',
      subtitle: 'Discover VELRUMA essentials made for daily comfort, sharp silhouettes and effortless styling.',
      image: products[0]?.images?.[0]?.url || collections[0]?.bannerImage || '',
      ctaLabel: 'Shop New Arrivals',
      ctaHref: '/shop',
      badge: 'New Drop',
      aspectRatio: '16 / 9',
      objectPosition: 'center',
      imageFit: 'contain',
    },
    {
      title: 'Oversized Fits Built For Every Day',
      subtitle: 'Clean details, versatile colors and premium fabrics for a wardrobe that works harder.',
      image: products[1]?.images?.[0]?.url || '',
      ctaLabel: 'Explore Collection',
      ctaHref: collections[0]?.slug ? `/collection/${collections[0].slug}` : '/collections',
      badge: 'VELRUMA 2026',
      aspectRatio: '16 / 9',
      objectPosition: 'center',
      imageFit: 'contain',
    },
  ];

  return (
    <div className="bg-[#F7F4EF] text-zinc-950">
      <HomeHeroSlider slides={slides.length ? slides : fallbackSlides} />

      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-0 px-4 py-4 text-center text-xs font-medium text-zinc-600 lg:px-8">
          <div className="flex items-center justify-center gap-2"><Truck className="h-4 w-4 text-amber-600" /> Free Shipping</div>
          <div className="flex items-center justify-center gap-2 border-x border-zinc-200"><RotateCcw className="h-4 w-4 text-amber-600" /> Easy Returns</div>
          <div className="flex items-center justify-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-600" /> Premium Quality</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 lg:py-5 lg:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Shop by Category</h2>
            <p className="text-sm text-zinc-500">Real categories from your catalog.</p>
          </div>
          <Link href="/shop" className="hidden items-center gap-1 text-sm font-semibold text-amber-700 sm:flex">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((category: any) => (
            <Link key={category._id.toString()} href={`/category/${category.slug}`} className="group overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="aspect-[4/3] bg-zinc-100">
                {category.image ? <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-zinc-400">VELRUMA</div>}
              </div>
              <div className="p-3">
                <p className="font-semibold">{category.name}</p>
                <p className="text-xs text-zinc-500">{category.description || 'Explore styles'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-4 lg:py-5">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>New Arrivals</h2>
              <p className="text-sm text-zinc-500">Live products from admin catalog.</p>
            </div>
            <Link href="/shop?sort=newest" className="hidden items-center gap-1 text-sm font-semibold text-amber-700 sm:flex">Shop all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {products.map((product: any) => {
              const finalPrice = price(product);
              return (
                <Link key={product._id.toString()} href={`/product/${product.slug}`} className="group rounded-lg bg-[#F7F4EF] p-2 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="aspect-[3/4] overflow-hidden rounded-md bg-zinc-100">
                    {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-zinc-400">No Image</div>}
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-1 text-sm font-semibold">{product.title}</p>
                    <p className="mt-1 text-sm font-bold">Rs.{finalPrice.toLocaleString('en-IN')}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 lg:py-5 lg:px-8">
        <div className="flex flex-wrap gap-6">
          {collections.map((collection: any) => (
            <Link key={collection._id.toString()} href={`/collection/${collection.slug}`} className="relative flex aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900 shadow-sm group">
              {collection.bannerImage && <img src={collection.bannerImage} alt={collection.name} className="absolute inset-0 h-full w-full object-cover object-top opacity-80 transition duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
              <div className="absolute bottom-0 w-full p-4 text-white">
                <p className="text-xl sm:text-2xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>{collection.name}</p>
                <p className="mt-1 text-xs sm:text-sm text-white/80">{collection.description || 'Curated collection'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
