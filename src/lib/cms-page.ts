import dbConnect from '@/lib/db';
import CmsPage from '@/models/CmsPage';
import { getAppUrl } from '@/lib/env';

export async function getPublishedCmsPage(slug: string) {
  await dbConnect();
  return CmsPage.findOne({ slug, status: 'published' }).lean();
}

export async function generateCmsMetadata(slug: string, fallbackTitle: string, fallbackDescription: string) {
  const page: any = await getPublishedCmsPage(slug);
  const seo = page?.seo || {};
  const title = seo.title || page?.title || fallbackTitle;
  const description = seo.description || page?.excerpt || fallbackDescription;
  const appUrl = getAppUrl();
  const canonical = seo.canonicalUrl || `${appUrl}/${slug}`;
  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;
  const twitterTitle = seo.twitterTitle || ogTitle;
  const twitterDescription = seo.twitterDescription || ogDescription;
  const ogImage = seo.ogImage || page?.heroImage || undefined;
  const twitterImage = seo.twitterImage || ogImage;
  const imageAlt = seo.ogTitle || seo.twitterTitle || title;

  return {
    title,
    description,
    keywords: seo.keywords || [],
    alternates: { canonical },
    robots: seo.robots || 'index,follow',
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: seo.ogType || 'website',
      images: ogImage ? [{
        url: ogImage,
        secureUrl: ogImage,
        width: 1200,
        height: 630,
        alt: imageAlt,
      }] : undefined,
    },
    twitter: {
      card: seo.twitterCard || 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      site: seo.twitterSite || undefined,
      creator: seo.twitterCreator || undefined,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}
