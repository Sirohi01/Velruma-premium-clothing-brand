import Link from 'next/link';
import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';

export default async function CollectionsPage() {
  await dbConnect();
  const collections = await Collection.find({ isActive: true }).sort({ createdAt: -1 }).lean();

  return (
    <div className="bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-zinc-900">Collections</h1>
          <p className="mt-3 text-zinc-600">Shop curated drops from VELRUMA.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {collections.map((collection: any) => (
            <Link key={collection._id.toString()} href={`/collection/${collection.slug}`} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
              <div className="aspect-square bg-zinc-200">
                {collection.bannerImage ? <img src={collection.bannerImage} alt={collection.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-zinc-500">VELRUMA</div>}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-zinc-900">{collection.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{collection.description || 'Explore this collection.'}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
