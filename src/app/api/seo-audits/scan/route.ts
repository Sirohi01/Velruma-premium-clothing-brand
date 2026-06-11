import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Collection from '@/models/Collection';
import Blog from '@/models/Blog';
import CmsPage from '@/models/CmsPage';
import { SeoAudit } from '@/models/Phase9';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';

function scoreAudit(input: {
  title?: string;
  description?: string;
  images?: { alt?: string }[];
  url: string;
  pageType: string;
  ogImage?: string;
  canonicalUrl?: string;
}) {
  const missingMetaTitle = !input.title;
  const missingMetaDescription = !input.description;
  const missingAltTags = (input.images || []).filter((image) => !image.alt).length;
  const recommendations = [
    missingMetaTitle ? 'Add a unique meta title.' : '',
    missingMetaDescription ? 'Add a clear meta description.' : '',
    missingAltTags > 0 ? `Add alt text to ${missingAltTags} image${missingAltTags === 1 ? '' : 's'}.` : '',
    !input.ogImage ? 'Add an OG image for rich social previews.' : '',
  ].filter(Boolean);
  const score = Math.max(
    0,
    100 -
      (missingMetaTitle ? 25 : 0) -
      (missingMetaDescription ? 25 : 0) -
      (!input.ogImage ? 10 : 0) -
      Math.min(30, missingAltTags * 5)
  );

  return {
    pageUrl: input.url,
    pageType: input.pageType,
    score,
    metaTitle: input.title || '',
    metaDescription: input.description || '',
    canonicalUrl: input.canonicalUrl || input.url,
    ogImage: input.ogImage || '',
    missingMetaTitle,
    missingMetaDescription,
    missingAltTags,
    duplicateTitle: false,
    brokenLinks: 0,
    recommendations,
    lastScannedAt: new Date(),
    notes: score < 80 ? 'Needs SEO improvement' : 'Looks healthy',
    isActive: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'seo-audits', 'create');
    if (!admin.ok) return admin.response;
    const [products, categories, collections, blogs, pages] = await Promise.all([
      Product.find({}).select('title slug seo images').lean(),
      Category.find({}).select('name slug seo image imageAlt').lean(),
      Collection.find({}).select('name slug seo bannerImage bannerImageAlt').lean(),
      Blog.find({}).select('title slug seo featuredImage featuredImageAlt heroImage').lean(),
      CmsPage.find({}).select('title slug seo heroImage heroImageAlt').lean(),
    ]);

    const audits = [
      ...products.map((item: any) => scoreAudit({ title: item.seo?.title || item.title, description: item.seo?.description, ogImage: item.seo?.ogImage || item.images?.[0]?.url, images: item.images || [], url: `/product/${item.slug}`, pageType: 'product' })),
      ...categories.map((item: any) => scoreAudit({ title: item.seo?.title || item.name, description: item.seo?.description, ogImage: item.seo?.ogImage || item.image, images: item.image ? [{ alt: item.imageAlt || item.name }] : [], url: `/category/${item.slug}`, pageType: 'category' })),
      ...collections.map((item: any) => scoreAudit({ title: item.seo?.title || item.name, description: item.seo?.description, ogImage: item.seo?.ogImage || item.bannerImage, images: item.bannerImage ? [{ alt: item.bannerImageAlt || item.name }] : [], url: `/collection/${item.slug}`, pageType: 'collection' })),
      ...blogs.map((item: any) => scoreAudit({ title: item.seo?.title || item.title, description: item.seo?.description, ogImage: item.seo?.ogImage || item.heroImage || item.featuredImage, images: item.featuredImage ? [{ alt: item.featuredImageAlt || item.title }] : [], url: `/blog/${item.slug}`, pageType: 'blog' })),
      ...pages.map((item: any) => scoreAudit({ title: item.seo?.title || item.title, description: item.seo?.description, ogImage: item.seo?.ogImage || item.heroImage, images: item.heroImage ? [{ alt: item.heroImageAlt || item.title }] : [], url: `/${item.slug}`, pageType: 'cms' })),
    ];

    await SeoAudit.deleteMany({});
    if (audits.length) await SeoAudit.insertMany(audits);
    await auditAdminAction({ request, context: admin.context, module: 'seo-audits', action: 'create', description: `scanned ${audits.length} SEO pages` });
    return NextResponse.json({ success: true, data: { scanned: audits.length } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'SEO scan failed' }, { status: 500 });
  }
}
