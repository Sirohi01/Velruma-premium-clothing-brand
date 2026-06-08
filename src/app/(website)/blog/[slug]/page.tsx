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

  return (
    <article className="bg-white dark:bg-[#0A0A0F]">
      {schemaJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />}
      <header className="mx-auto max-w-4xl px-4 py-16 text-center lg:px-8 lg:py-24">
        <p className="text-xs uppercase tracking-wide text-amber-500">{post.category}</p>
        <h1 className="mt-3 text-4xl font-bold text-zinc-900 dark:text-white lg:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>{post.title}</h1>
        {post.excerpt && <p className="mx-auto mt-5 max-w-2xl text-zinc-500">{post.excerpt}</p>}
      </header>
      {(post.heroImage || post.coverImage) && (
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="aspect-[16/5] overflow-hidden bg-zinc-100">
            <img src={post.heroImage || post.coverImage} alt="" className="h-full w-full" style={{ objectFit: post.heroImageFit || 'cover', objectPosition: post.heroImagePosition || 'center' }} />
          </div>
        </div>
      )}
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
