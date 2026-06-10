import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';
import Product from '@/models/Product';
import CollectionImageModal from '@/components/website/CollectionImageModal';

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const collection = await Collection.findOne({ slug, isActive: true }).lean();
  if (!collection) notFound();
  const products = await Product.find({ collections: collection._id, status: 'active' }).sort({ createdAt: -1 }).lean();

  return (
    <div className="bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {collection.bannerImage ? (
          <div className="mb-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="w-full max-w-[300px] lg:max-w-[400px] shrink-0">
              <CollectionImageModal imageUrl={collection.bannerImage} alt={collection.bannerImageAlt || collection.name} />
            </div>
            <div className="flex-1 text-center md:text-left px-2 sm:px-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{collection.name}</h1>
              <p className="mt-4 max-w-xl text-zinc-600 text-sm sm:text-base leading-relaxed mx-auto md:mx-0">{collection.description || 'Curated VELRUMA collection.'}</p>
            </div>
          </div>
        ) : (
          <div className="mb-10 overflow-hidden rounded-2xl bg-white border border-zinc-200/60 p-10 sm:p-14 md:p-20 text-center text-zinc-900 min-h-[250px] flex flex-col items-center justify-center shadow-sm">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>{collection.name}</h1>
            <p className="mt-5 max-w-2xl text-zinc-600 leading-relaxed">{collection.description || 'Curated VELRUMA collection.'}</p>
          </div>
        )}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product: any) => (
            <Link key={product._id.toString()} href={`/product/${product.slug}`} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
              <div className="aspect-[9/16] bg-zinc-100">
                {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.images[0].alt || product.title} className="h-full w-full object-cover object-top" /> : <div className="flex h-full items-center justify-center text-zinc-400">No Image</div>}
              </div>
              <div className="p-1 text-center">
                <h3 className="text-sm font-medium text-zinc-900">{product.title}</h3>
                <p className="mt-1 text-sm text-amber-700">INR {(product.salePrice || product.basePrice).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
