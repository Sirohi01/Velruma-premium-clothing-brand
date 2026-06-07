import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';
import Product from '@/models/Product';

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const collection = await Collection.findOne({ slug, isActive: true }).lean();
  if (!collection) notFound();
  const products = await Product.find({ collections: collection._id, status: 'active' }).sort({ createdAt: -1 }).lean();

  return (
    <div className="bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-10 overflow-hidden rounded-2xl bg-zinc-900 p-8 text-white">
          <h1 className="text-4xl font-bold">{collection.name}</h1>
          <p className="mt-3 max-w-2xl text-zinc-300">{collection.description || 'Curated VELRUMA collection.'}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product: any) => (
            <Link key={product._id.toString()} href={`/product/${product.slug}`} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
              <div className="aspect-[3/4] bg-zinc-100">
                {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-zinc-400">No Image</div>}
              </div>
              <div className="p-4 text-center">
                <h3 className="text-sm font-medium text-zinc-900">{product.title}</h3>
                <p className="mt-2 text-sm text-amber-700">INR {(product.salePrice || product.basePrice).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
