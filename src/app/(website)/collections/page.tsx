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
        <div className="flex flex-wrap gap-6 md:gap-8">
          {collections.map((collection: any) => (
            <Link key={collection._id.toString()} href={`/collection/${collection.slug}`} className="group flex flex-col w-[280px] sm:w-[320px] overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
              <div className="relative aspect-[4/5] w-full bg-zinc-200 overflow-hidden">
                {collection.bannerImage ? <img src={collection.bannerImage} alt={collection.bannerImageAlt || collection.name} className="absolute inset-0 h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-zinc-500">VELRUMA</div>}
              </div>
              <div className="p-4 sm:p-5 flex-1">
                <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-amber-700 transition-colors">{collection.name}</h2>
                <p className="mt-1 sm:mt-2 line-clamp-2 text-xs sm:text-sm text-zinc-500">{collection.description || 'Explore this collection.'}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
