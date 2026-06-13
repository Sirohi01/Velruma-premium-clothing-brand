import Link from 'next/link';
import { ArrowRight, BookOpen, Gift, Heart, RotateCcw, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Collection from '@/models/Collection';
import Setting from '@/models/Setting';
import Order from '@/models/Order';
import Blog from '@/models/Blog';
import Coupon from '@/models/Coupon';
import CmsPage from '@/models/CmsPage';
import LookbookItem from '@/models/LookbookItem';
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

function mrp(product: any) {
  return Number(product.basePrice || 0);
}

function parseSlides(value: unknown): HeroSlide[] {
  try {
    const slides = typeof value === 'string' && value.trim()
      ? JSON.parse(value)
      : Array.isArray(value)
        ? value
        : [];
    return (Array.isArray(slides) ? slides : []).filter((slide: HeroSlide) => slide?.image || slide?.title || slide?.subtitle);
  } catch {
    return [];
  }
}

async function bestSellerProducts() {
  const orders = await Order.find({ orderStatus: { $nin: ['Cancelled', 'Returned'] }, paymentStatus: { $ne: 'Refunded' } })
    .select('items')
    .lean();
  const sold = new Map<string, number>();
  for (const order of orders as any[]) {
    for (const item of order.items || []) {
      const id = String(item.productId || '');
      if (!id) continue;
      sold.set(id, (sold.get(id) || 0) + Number(item.quantity || 0));
    }
  }
  const ids = Array.from(sold.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => id);
  if (ids.length === 0) return [];
  const found = await Product.find({ _id: { $in: ids }, status: 'active' }).lean();
  return ids.map((id) => found.find((product: any) => String(product._id) === id)).filter(Boolean);
}

function activeCouponQuery(now: Date) {
  return {
    isActive: true,
    $and: [
      { $or: [{ validFrom: { $exists: false } }, { validFrom: null }, { validFrom: { $lte: now } }] },
      { $or: [{ validUntil: { $exists: false } }, { validUntil: null }, { validUntil: { $gte: now } }] },
    ],
  };
}

function ProductTile({ product, tone = 'light' }: { product: any; tone?: 'light' | 'white' }) {
  const finalPrice = price(product);
  const productMrp = mrp(product);
  return (
    <Link href={`/product/${product.slug}`} className={`group rounded-lg p-2 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md ${tone === 'white' ? 'bg-white' : 'bg-[#F7F4EF]'}`}>
      <div className="aspect-[3/4] overflow-hidden rounded-md bg-zinc-100">
        {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.images[0].alt || product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-zinc-400">No Image</div>}
      </div>
      <div className="p-2">
        <p className="line-clamp-1 text-sm font-semibold">{product.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold">Rs.{finalPrice.toLocaleString('en-IN')}</p>
          {productMrp > finalPrice && <p className="text-xs text-zinc-400 line-through">Rs.{productMrp.toLocaleString('en-IN')}</p>}
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  await dbConnect();
  const now = new Date();
  const [products, bestSellers, categories, collections, heroSetting, lookbookItems, blogs, activeCoupons, testimonialPages] = await Promise.all([
    Product.find({ status: 'active' }).sort({ createdAt: -1 }).limit(8).lean(),
    bestSellerProducts(),
    Category.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 }).limit(8).lean(),
    Collection.find({ isActive: true }).sort({ createdAt: -1 }).limit(4).lean(),
    Setting.findOne({ key: 'home_hero_slides' }).lean(),
    LookbookItem.find({ isActive: true, status: 'published' }).sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 }).limit(6).lean(),
    Blog.find({ status: 'published' }).sort({ publishedAt: -1, createdAt: -1 }).limit(3).lean(),
    Coupon.find(activeCouponQuery(now)).sort({ discountValue: -1, createdAt: -1 }).limit(2).lean(),
    CmsPage.find({ type: 'testimonial', status: 'published' }).sort({ updatedAt: -1 }).limit(3).lean(),
  ]);
  const testimonials = testimonialPages.flatMap((page: any) => page.sections || []).filter((section: any) => section.type === 'testimonial' || section.title || section.body).slice(0, 3);

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
      imageFit: 'cover',
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
      imageFit: 'cover',
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
                {category.image ? <img src={category.image} alt={category.imageAlt || category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-zinc-400">VELRUMA</div>}
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
            {products.map((product: any) => <ProductTile key={product._id.toString()} product={product} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 lg:py-5 lg:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Collections</h2>
            <p className="text-sm text-zinc-500">Curated drops from backend collections.</p>
          </div>
          <Link href="/collections" className="hidden items-center gap-1 text-sm font-semibold text-amber-700 sm:flex">Explore all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection: any) => (
            <Link key={collection._id.toString()} href={`/collection/${collection.slug}`} className="relative flex aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900 shadow-sm group">
              {collection.bannerImage && <img src={collection.bannerImage} alt={collection.bannerImageAlt || collection.name} className="absolute inset-0 h-full w-full object-cover object-top opacity-80 transition duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
              <div className="absolute bottom-0 w-full p-4 text-white">
                <p className="text-xl sm:text-2xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>{collection.name}</p>
                <p className="mt-1 text-xs sm:text-sm text-white/80">{collection.description || 'Curated collection'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {bestSellers.length > 0 && (
        <section className="bg-white py-4 lg:py-5">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Best Sellers</h2>
                <p className="text-sm text-zinc-500">Ranked from real order history.</p>
              </div>
              <Link href="/shop" className="hidden items-center gap-1 text-sm font-semibold text-amber-700 sm:flex">Shop best picks <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {bestSellers.map((product: any) => <ProductTile key={product._id.toString()} product={product} tone="white" />)}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
        <div className="grid gap-2 md:grid-cols-4">
          {[
            [Sparkles, 'Premium Cotton', 'Soft structure with everyday durability.'],
            [ShieldCheck, 'Quality Checked', 'Every drop goes through fit and finish checks.'],
            [Truck, 'Fast Dispatch', 'Orders move quickly from our backend workflow.'],
            [Heart, 'Built For Repeat Wear', 'Minimal essentials made for daily styling.'],
          ].map(([Icon, title, text]: any) => (
            <div key={title} className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-sm">
              <Icon className="h-4 w-4 text-amber-600" />
              <h3 className="mt-1.5 text-sm font-semibold leading-tight">{title}</h3>
              <p className="mt-0.5 text-xs leading-4 text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {activeCoupons.length > 0 && (
        <section className="bg-zinc-950 py-5 text-white">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 lg:grid-cols-2 lg:px-8">
            {activeCoupons.map((coupon: any) => (
              <div key={coupon._id.toString()} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Active Offer</p>
                    <h2 className="mt-2 text-2xl font-semibold">{coupon.title}</h2>
                    <p className="mt-1 text-sm text-white/70">{coupon.description || 'Apply this coupon during checkout.'}</p>
                  </div>
                  <div className="rounded-lg bg-amber-400 px-3 py-2 font-mono text-sm font-bold text-black">{coupon.code}</div>
                </div>
                <p className="mt-4 text-sm text-white/80">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `Rs.${coupon.discountValue} off`} on orders above Rs.{Number(coupon.minOrderValue || 0).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {lookbookItems.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-4 lg:px-8 lg:py-5">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Lookbook Preview</h2>
              <p className="text-sm text-zinc-500">Live visuals from admin lookbook.</p>
            </div>
            <Link href="/lookbook" className="hidden items-center gap-1 text-sm font-semibold text-amber-700 sm:flex">Open lookbook <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {lookbookItems.map((item: any) => {
              const image = item.thumbnailUrl || item.mediaUrl;
              return (
                <Link key={item._id.toString()} href="/lookbook" className="group overflow-hidden rounded-lg bg-white ring-1 ring-zinc-200">
                  <div className="aspect-square bg-zinc-100">
                    {image ? <img src={image} alt={item.alt || item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-xs text-zinc-400">{item.type}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="bg-white py-4 lg:py-5">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-5">
              <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Customer Love</h2>
              <p className="text-sm text-zinc-500">Testimonials managed from CMS.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {testimonials.map((review: any, index: number) => (
                <div key={review._id?.toString?.() || index} className="rounded-lg border border-zinc-200 bg-[#F7F4EF] p-5">
                  <div className="flex gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, star) => <Star key={star} className="h-4 w-4 fill-current" />)}</div>
                  <p className="mt-4 text-sm leading-6 text-zinc-700">{review.body || review.caption || 'Premium quality and comfortable fit.'}</p>
                  <p className="mt-4 text-sm font-semibold">{review.title || 'VELRUMA Customer'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {blogs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-4 lg:px-8 lg:py-5">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>From The Journal</h2>
              <p className="text-sm text-zinc-500">Latest SEO content from blog backend.</p>
            </div>
            <Link href="/blog" className="hidden items-center gap-1 text-sm font-semibold text-amber-700 sm:flex">Read all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {blogs.map((post: any) => (
              <Link key={post._id.toString()} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="aspect-[4/3] bg-zinc-100">
                  {(post.cardImage || post.coverImage || post.heroImage) ? <img src={post.cardImage || post.coverImage || post.heroImage} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-zinc-400"><BookOpen className="h-6 w-6" /></div>}
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{post.category || 'Style'}</p>
                  <h3 className="mt-2 line-clamp-2 font-semibold">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-zinc-200 bg-white py-4">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 text-sm text-zinc-600 md:grid-cols-4 lg:px-8">
          <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-amber-600" /> COD available</div>
          <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-amber-600" /> 7 day returns</div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-600" /> Secure checkout</div>
          <div className="flex items-center gap-2"><Gift className="h-4 w-4 text-amber-600" /> Loyalty points on orders</div>
        </div>
      </section>
    </div>
  );
}
