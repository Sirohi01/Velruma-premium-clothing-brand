import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) notFound();
  const products = await Product.find({ category: category._id, status: 'active' }).sort({ createdAt: -1 }).lean();

  return (
    <ListingPage
      title={category.name}
      description={category.description || 'Explore products in this category.'}
      products={products}
    />
  );
}

function ListingPage({ title, description, products }: { title: string; description: string; products: any[] }) {
  return (
    <div className="bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-10 border-b border-zinc-200 pb-6">
          <h1 className="text-4xl font-bold text-zinc-900">{title}</h1>
          <p className="mt-3 text-zinc-600">{description}</p>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}

function ProductGrid({ products }: { products: any[] }) {
  if (products.length === 0) return <div className="rounded-xl bg-white p-10 text-center text-zinc-500">No products found.</div>;
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
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
  );
}
