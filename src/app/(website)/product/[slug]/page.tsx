import React from 'react';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { notFound } from 'next/navigation';
import { Shirt, Maximize, Droplet, Users, Share2, Heart, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RecentlyViewed from './RecentlyViewed';
import AddToCartButton from '@/app/(website)/product/[slug]/AddToCartButton';
import MediaGallery from '@/app/(website)/product/[slug]/MediaGallery';
import { getAppUrl } from '@/lib/env';

function calculatePrice(product: any) {
  const mrp = Number(product.basePrice || 0);
  const sellingBeforeDiscount = Number(product.salePrice || product.basePrice || 0);
  const discountType = product.discountType || 'none';
  const discountValue = Number(product.discountValue || 0);
  const extraDiscount = discountType === 'percentage'
    ? Math.round((sellingBeforeDiscount * discountValue) / 100)
    : discountType === 'fixed'
      ? discountValue
      : 0;
  const finalPrice = Math.max(0, sellingBeforeDiscount - extraDiscount);
  const totalDiscount = Math.max(0, mrp - finalPrice);
  const discountPercent = mrp > 0 && totalDiscount > 0 ? Math.round((totalDiscount / mrp) * 100) : 0;
  return { mrp, sellingBeforeDiscount, finalPrice, extraDiscount, discountPercent };
}

function productDescription(product: any) {
  return product.seo?.description || product.shortDescription || product.description?.slice(0, 155) || product.title;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const product: any = await Product.findOne({ slug, status: 'active' }).lean();
  if (!product) return {};
  const image = product.images?.find((item: any) => item.isPrimary)?.url || product.images?.[0]?.url;
  return {
    title: product.seo?.title || product.title,
    description: productDescription(product),
    openGraph: {
      title: product.seo?.title || product.title,
      description: productDescription(product),
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await dbConnect();
  const { slug } = await params;

  const product: any = await Product.findOne({ slug, status: 'active' })
    .populate('category', 'name sizeChartImage sizeChart')
    .lean();

  if (!product) notFound();

  const relatedProducts = await Product.find({
    category: product.category?._id || product.category,
    _id: { $ne: product._id },
    status: 'active',
  }).limit(4).lean();

  const sizes = [...new Set((product.variants || []).map((v: any) => v.size))].filter(Boolean);
  const colors = [...new Set((product.variants || []).map((v: any) => v.color))].filter(Boolean);
  const pricing = calculatePrice(product);
  const totalStock = (product.variants || []).reduce((sum: number, variant: any) => sum + Number(variant.stock || 0), 0);
  const primaryImage = product.images?.find((item: any) => item.isPrimary)?.url || product.images?.[0]?.url;
  const baseUrl = getAppUrl();
  const sizeChartImage = product.category?.sizeChartImage;
  const sizeChart = product.category?.sizeChart ? {
    columns: product.category.sizeChart.sizes || [],
    rows: (product.category.sizeChart.measurements || []).map((m: any) => ({
      label: m.name,
      values: m.values,
    }))
  } : undefined;

  const serializedProduct = {
    _id: product._id.toString(),
    title: product.title,
    slug: product.slug,
    basePrice: product.basePrice,
    salePrice: product.salePrice || product.basePrice,
    discountType: product.discountType || 'none',
    discountValue: product.discountValue || 0,
    images: (product.images || []).map((image: any) => ({
      url: image.url || '',
      alt: image.alt || '',
      isPrimary: Boolean(image.isPrimary),
    })),
    videos: (product.videos || []).map((video: any) => ({
      url: video.url || '',
      title: video.title || '',
      isPrimary: Boolean(video.isPrimary),
    })),
    variants: (product.variants || []).map((v: any) => ({
      _id: v._id.toString(),
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      extraPrice: v.extraPrice,
    })),
  };
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: productDescription(product),
    image: (product.images || []).map((image: any) => image.url).filter(Boolean),
    sku: product.variants?.find((variant: any) => variant.sku)?.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'VELRUMA',
    },
    category: product.category?.name || undefined,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: pricing.finalPrice,
      itemCondition: 'https://schema.org/NewCondition',
      availability: totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      image: primaryImage || undefined,
    },
  };

  return (
    <div className="bg-[#FAF9F6]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Column */}
          <div className="flex flex-col gap-8">
            <MediaGallery images={serializedProduct.images} videos={serializedProduct.videos} title={product.title} />
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {product.gender || 'unisex'}
                </span>
                {product.category?.name && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-600">
                    {product.category.name}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-1 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                {product.title}
              </h1>
              <div className="flex shrink-0 items-center gap-3 pt-2">
                <button className="text-zinc-500 hover:text-zinc-900 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="text-zinc-500 hover:text-zinc-900 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            {product.shortDescription && <p className="mt-3 text-zinc-600">{product.shortDescription}</p>}

            <div className="mt-1 space-y-2">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-semibold text-zinc-900">₹{pricing.finalPrice.toLocaleString('en-IN')}</span>
                {pricing.mrp > pricing.finalPrice && (
                  <>
                    <span className="pb-1 text-lg text-zinc-400 line-through">₹{pricing.mrp.toLocaleString('en-IN')}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-zinc-500">MRP inclusive of all taxes.</p>
            </div>

            <div className="mt-8">
              <AddToCartButton product={serializedProduct} sizes={sizes as string[]} colors={colors as string[]} sizeChartImage={sizeChartImage} sizeChart={sizeChart} />
            </div>
          </div>
        </div>

        {/* Full Width Details Section */}
        <div className="mt-2">
          {/* Features */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-6 sm:grid-cols-4 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <Shirt className="mb-2 h-6 w-6 text-zinc-900" />
              <span className="text-xs font-semibold text-zinc-900">PREMIUM COTTON</span>
              <span className="text-[10px] text-zinc-500">240 GSM Fabric</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Maximize className="mb-2 h-6 w-6 text-zinc-900" />
              <span className="text-xs font-semibold text-zinc-900">OVERSIZED FIT</span>
              <span className="text-[10px] text-zinc-500">Relaxed & Comfortable</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Droplet className="mb-2 h-6 w-6 text-zinc-900" />
              <span className="text-xs font-semibold text-zinc-900">MINIMAL DESIGN</span>
              <span className="text-[10px] text-zinc-500">Signature Logo</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Users className="mb-2 h-6 w-6 text-zinc-900" />
              <span className="text-xs font-semibold text-zinc-900">UNISEX</span>
              <span className="text-[10px] text-zinc-500">For Everyone</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-1 max-w-5xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200">
            <Tabs defaultValue="description">
              <TabsList className="w-full justify-start border-b border-zinc-200 rounded-none bg-transparent p-0 overflow-x-auto overflow-y-hidden hide-scrollbar">
                <TabsTrigger value="description" className="whitespace-nowrap data-active:border-b-2 data-active:border-zinc-900 rounded-none !bg-transparent px-6 pb-3 pt-2 text-sm font-semibold uppercase text-zinc-500 data-active:!text-zinc-900 data-active:shadow-none border-b-2 border-transparent hover:!bg-transparent hover:!text-zinc-900">
                  Description
                </TabsTrigger>
                <TabsTrigger value="details" className="whitespace-nowrap data-active:border-b-2 data-active:border-zinc-900 rounded-none !bg-transparent px-6 pb-3 pt-2 text-sm font-semibold uppercase text-zinc-500 data-active:!text-zinc-900 data-active:shadow-none border-b-2 border-transparent hover:!bg-transparent hover:!text-zinc-900">
                  Product Details
                </TabsTrigger>
                <TabsTrigger value="wash" className="whitespace-nowrap data-active:border-b-2 data-active:border-zinc-900 rounded-none !bg-transparent px-6 pb-3 pt-2 text-sm font-semibold uppercase text-zinc-500 data-active:!text-zinc-900 data-active:shadow-none border-b-2 border-transparent hover:!bg-transparent hover:!text-zinc-900">
                  Wash Care
                </TabsTrigger>
                <TabsTrigger value="delivery" className="whitespace-nowrap data-active:border-b-2 data-active:border-zinc-900 rounded-none !bg-transparent px-6 pb-3 pt-2 text-sm font-semibold uppercase text-zinc-500 data-active:!text-zinc-900 data-active:shadow-none border-b-2 border-transparent hover:!bg-transparent hover:!text-zinc-900">
                  Delivery & Returns
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-8 text-sm leading-relaxed text-zinc-600 whitespace-pre-line px-2">
                {product.description}
              </TabsContent>
              <TabsContent value="details" className="mt-8 text-sm leading-relaxed text-zinc-600 px-2">
                <ul className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {product.productDetails && product.productDetails.length > 0 ? (
                    product.productDetails.map((detail: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <span className="text-zinc-700">{detail}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Made in India with ❤️</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Premium heavyweight cotton fabric</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Ribbed crew neck</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Dropped shoulders for a relaxed fit</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">High-density puff print graphic</span></li>
                    </>
                  )}
                </ul>
              </TabsContent>
              <TabsContent value="wash" className="mt-8 text-sm leading-relaxed text-zinc-600 px-2">
                <ul className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {product.washCare && product.washCare.length > 0 ? (
                    product.washCare.map((care: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <span className="text-zinc-700">{care}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Machine wash cold inside out</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Do not bleach</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Tumble dry low or hang dry</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Do not iron directly on print</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Wash with similar colors</span></li>
                    </>
                  )}
                </ul>
              </TabsContent>
              <TabsContent value="delivery" className="mt-8 text-sm leading-relaxed text-zinc-600 px-2">
                <ul className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {product.deliveryReturns && product.deliveryReturns.length > 0 ? (
                    product.deliveryReturns.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <span className="text-zinc-700">{item}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Orders are dispatched within 24-48 hours.</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">Delivery takes 3-7 business days depending on location.</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">We offer a 7-day hassle-free return/exchange policy.</span></li>
                      <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><span className="text-zinc-700">For returns, ensure tags are intact and unwashed.</span></li>
                    </>
                  )}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12 border-t border-zinc-200 pt-8">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              You May Also Like
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((rp: any) => {
                const rpPrice = calculatePrice(rp);
                return (
                  <a key={rp._id.toString()} href={`/product/${rp.slug}`} className="group relative block overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
                    <div className="aspect-[3/4] overflow-hidden bg-zinc-100">
                      {rp.images?.[0]?.url ? (
                        <img src={rp.images[0].url} alt={rp.title} className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-400">No Image</div>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="line-clamp-1 text-sm font-medium text-zinc-900">{rp.title}</h3>
                      <p className="mt-2 text-sm text-zinc-500">₹{rpPrice.finalPrice.toLocaleString('en-IN')}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <RecentlyViewed currentProduct={serializedProduct} />
      </div>
    </div>
  );
}
