import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const post: any = await Blog.findOne({ slug, status: 'published' }).lean();
  if (!post) return {};
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
    openGraph: { title: post.seo?.title || post.title, description: post.seo?.description || post.excerpt, images: post.seo?.ogImage || post.coverImage ? [{ url: post.seo?.ogImage || post.coverImage }] : undefined },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const post: any = await Blog.findOne({ slug, status: 'published' }).lean();
  if (!post) notFound();

  return (
    <article className="bg-white dark:bg-[#0A0A0F]">
      <header className="mx-auto max-w-4xl px-4 py-16 text-center lg:px-8 lg:py-24">
        <p className="text-xs uppercase tracking-wide text-amber-500">{post.category}</p>
        <h1 className="mt-3 text-4xl font-bold text-zinc-900 dark:text-white lg:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>{post.title}</h1>
        {post.excerpt && <p className="mx-auto mt-5 max-w-2xl text-zinc-500">{post.excerpt}</p>}
      </header>
      {post.coverImage && (
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-zinc-100">
            <img src={post.coverImage} alt="" className="h-full w-full object-cover object-center" />
          </div>
        </div>
      )}
      <div className="prose prose-zinc mx-auto max-w-3xl px-4 py-12 dark:prose-invert lg:px-8">
        {post.content.split('\n').filter(Boolean).map((paragraph: string, index: number) => <p key={index}>{paragraph}</p>)}
      </div>
    </article>
  );
}
