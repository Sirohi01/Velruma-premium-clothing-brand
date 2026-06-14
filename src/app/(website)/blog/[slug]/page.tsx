import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { getAppUrl } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const post: any = await Blog.findOne({ slug, status: 'published' }).lean();
  if (!post) return {};
  const seo = post.seo || {};
  const title = seo.title || post.title;
  const description = seo.description || post.excerpt;
  const image = seo.ogImage || post.heroImage || post.coverImage || post.cardImage;
  const canonical = seo.canonicalUrl || `${getAppUrl()}/blog/${post.slug}`;
  return {
    title,
    description,
    keywords: seo.keywords || [],
    alternates: { canonical },
    robots: seo.robots || 'index,follow',
    openGraph: { title: seo.ogTitle || title, description: seo.ogDescription || description, url: canonical, images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', title: seo.twitterTitle || seo.ogTitle || title, description: seo.twitterDescription || seo.ogDescription || description, images: image ? [image] : undefined },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const post: any = await Blog.findOne({ slug, status: 'published' }).lean();
  if (!post) notFound();
  const schemaJson = post.seo?.schemaJson || '';
  const heroImage = post.heroImage || post.coverImage;
  const heroAlt = post.heroImageAlt || post.title;

  return (
    <article className="bg-[#FAF9F6] dark:bg-[#0A0A0F]">
      {schemaJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />}

      {heroImage && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <div
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm"
            style={{ aspectRatio: post.heroImageAspectRatio || '16 / 5' }}
          >
            <img
              src={heroImage}
              alt={heroAlt}
              className="h-full w-full"
              style={{ objectFit: post.heroImageFit || 'cover', objectPosition: post.heroImagePosition || 'center' }}
            />
          </div>
        </div>
      )}

      <header className="mx-auto max-w-4xl px-4 py-10 text-center lg:px-8 lg:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-600">{post.category}</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-zinc-900 dark:text-white lg:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>{post.title}</h1>
        {post.excerpt && <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
          {post.authorName && <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">{post.authorName}</span>}
          {post.publishedAt && <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
        </div>
      </header>

      {post.video && (
        <div className="mx-auto mt-5 max-w-5xl px-4 lg:px-8">
          <div className="mx-auto max-h-[72vh] overflow-hidden bg-zinc-100" style={{ aspectRatio: post.videoAspectRatio || '16 / 9', maxWidth: ['9 / 16', '4 / 5', '1 / 1'].includes(post.videoAspectRatio || '') ? 'min(100%, 520px)' : undefined }}>
            <video src={post.video} controls playsInline preload="metadata" className="h-full w-full" style={{ objectFit: post.videoFit || 'contain', objectPosition: post.videoPosition || 'center' }} />
          </div>
        </div>
      )}
      <div className="prose prose-zinc mx-auto max-w-3xl px-4 py-12 dark:prose-invert lg:px-8">
        {post.content.split('\n').filter(Boolean).map((paragraph: string, index: number) => <p key={index}>{paragraph}</p>)}
      </div>
    </article>
  );
}
