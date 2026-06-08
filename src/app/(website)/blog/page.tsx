import Link from 'next/link';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  await dbConnect();
  const posts = await Blog.find({ status: 'published' }).sort({ publishedAt: -1, createdAt: -1 }).lean();

  return (
    <div className="bg-white dark:bg-[#0A0A0F]">
      <section className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8 lg:py-24">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white lg:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>VELRUMA Journal</h1>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-500">Style guides, collection stories, care tips and brand updates.</p>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 p-10 text-center text-zinc-500 dark:border-white/10">No published posts yet.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post: any) => (
              <Link key={String(post._id)} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900">
                <div className="aspect-square bg-zinc-100 dark:bg-white/5">{post.cardImage || post.coverImage ? <img src={post.cardImage || post.coverImage} alt="" className="h-full w-full object-cover object-center" /> : null}</div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-amber-500">{post.category}</p>
                  <h2 className="mt-2 text-xl font-semibold text-zinc-900 group-hover:text-amber-600 dark:text-white">{post.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm text-zinc-500">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
