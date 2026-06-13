import React from 'react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

type SearchParams = { [key: string]: string | string[] | undefined };

function value(params: SearchParams, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

function hrefWith(params: SearchParams, next: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    const val = Array.isArray(raw) ? raw[0] : raw;
    if (val) search.set(key, val);
  }
  for (const [key, val] of Object.entries(next)) {
    if (val) search.set(key, val);
    else search.delete(key);
  }
  const qs = search.toString();
  return qs ? `/shop?${qs}` : '/shop';
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await dbConnect();

  const params = await searchParams;
  const categoryFilter = value(params, 'category');
  const q = value(params, 'q') || '';
  const size = value(params, 'size');
  const color = value(params, 'color');
  const gender = value(params, 'gender');
  const sort = value(params, 'sort') || 'newest';
  const min = Number(value(params, 'min') || 0);
  const max = Number(value(params, 'max') || 0);

  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
  const query: any = { status: 'active' };
  if (categoryFilter) {
    const cat = await Category.findOne({ slug: categoryFilter }).lean();
    if (cat) query.category = cat._id;
  }
  if (q) query.title = { $regex: q, $options: 'i' };
  if (size) query['variants.size'] = size;
  if (color) query['variants.color'] = color;
  if (gender) query.gender = gender;
  if (min || max) query.basePrice = { ...(min ? { $gte: min } : {}), ...(max ? { $lte: max } : {}) };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_low: { basePrice: 1 },
    price_high: { basePrice: -1 },
    name: { title: 1 },
  };
  const products = await Product.find(query).sort(sortMap[sort] || sortMap.newest).lean();

  const allProducts = await Product.find({ status: 'active' }, { variants: 1 }).lean();
  const sizes = [...new Set(allProducts.flatMap((product: any) => product.variants?.map((variant: any) => variant.size) || []))].filter(Boolean);
  const colors = [...new Set(allProducts.flatMap((product: any) => product.variants?.map((variant: any) => variant.color) || []))].filter(Boolean);

  return (
    <div className="bg-[#FAF9F6]">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-zinc-200 pb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">The Collection</h1>
          <p className="mt-4 text-zinc-600">Discover premium modern D2C fashion.</p>
        </div>

        <div className="grid gap-10 md:grid-cols-[260px_1fr]">
          <aside className="space-y-8">
            <form action="/shop" className="rounded-xl bg-white p-4 shadow-sm">
              <label className="text-sm font-semibold text-zinc-900">Search</label>
              <input name="q" defaultValue={q} placeholder="Search products..." className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-600" />
              {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <input name="min" defaultValue={min || ''} placeholder="Min" className="h-10 rounded-lg border border-zinc-200 px-3 text-sm" />
                <input name="max" defaultValue={max || ''} placeholder="Max" className="h-10 rounded-lg border border-zinc-200 px-3 text-sm" />
              </div>
              <button className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">Apply</button>
            </form>

            <Filter title="Categories">
              <Link href={hrefWith(params, { category: undefined })} className={!categoryFilter ? 'text-amber-700' : 'text-zinc-500 hover:text-zinc-900'}>All Products</Link>
              {categories.map((cat: any) => (
                <Link key={cat._id.toString()} href={hrefWith(params, { category: cat.slug })} className={categoryFilter === cat.slug ? 'text-amber-700' : 'text-zinc-500 hover:text-zinc-900'}>{cat.name}</Link>
              ))}
            </Filter>

            <Filter title="Size">
              {sizes.map((item) => <Link key={item} href={hrefWith(params, { size: size === item ? undefined : item })} className={size === item ? 'text-amber-700' : 'text-zinc-500 hover:text-zinc-900'}>{item}</Link>)}
            </Filter>

            <Filter title="Color">
              {colors.map((item) => <Link key={item} href={hrefWith(params, { color: color === item ? undefined : item })} className={color === item ? 'text-amber-700' : 'text-zinc-500 hover:text-zinc-900'}>{item}</Link>)}
            </Filter>

            <Filter title="Audience">
              {['male', 'female', 'unisex'].map((item) => <Link key={item} href={hrefWith(params, { gender: gender === item ? undefined : item })} className={gender === item ? 'text-amber-700 capitalize' : 'text-zinc-500 hover:text-zinc-900 capitalize'}>{item}</Link>)}
            </Filter>
          </aside>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-zinc-500">{products.length} products</p>
              <div className="flex gap-2 text-sm">
                <Link href={hrefWith(params, { sort: 'newest' })} className={sort === 'newest' ? 'font-semibold text-zinc-900' : 'text-zinc-500'}>Newest</Link>
                <Link href={hrefWith(params, { sort: 'price_low' })} className={sort === 'price_low' ? 'font-semibold text-zinc-900' : 'text-zinc-500'}>Price Low</Link>
                <Link href={hrefWith(params, { sort: 'price_high' })} className={sort === 'price_high' ? 'font-semibold text-zinc-900' : 'text-zinc-500'}>Price High</Link>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-100 bg-white">
                <p className="text-zinc-500">No products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product: any) => <ProductCard key={product._id.toString()} product={product} />)}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Filter({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-900">{title}</h2>
      <div className="flex flex-col gap-2 text-sm">{children}</div>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const price = product.salePrice && product.salePrice < product.basePrice ? product.salePrice : product.basePrice;
  const mrp = Number(product.basePrice || 0);
  return (
    <Link href={`/product/${product.slug}`} className="group relative block overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
        {product.salePrice && product.salePrice < product.basePrice && <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold tracking-wider text-white">SALE</span>}
      </div>
      <div className="aspect-[3/4] overflow-hidden bg-zinc-100">
        {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.images[0].alt || product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-zinc-400">No Image</div>}
      </div>
      <div className="p-4 text-center">
        <h3 className="line-clamp-1 text-sm font-medium text-zinc-900">{product.title}</h3>
        <div className="mt-2 flex items-center justify-center gap-2">
          <p className="text-sm font-semibold text-amber-700">INR {price.toLocaleString()}</p>
          {mrp > price && <p className="text-xs text-zinc-400 line-through">INR {mrp.toLocaleString()}</p>}
        </div>
      </div>
    </Link>
  );
}
