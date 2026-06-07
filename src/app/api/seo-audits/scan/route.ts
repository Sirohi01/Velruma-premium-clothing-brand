import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Collection from '@/models/Collection';
import Blog from '@/models/Blog';
import CmsPage from '@/models/CmsPage';
import { SeoAudit } from '@/models/Phase9';

function scoreAudit(input: {
  title?: string;
  description?: string;
  images?: { alt?: string }[];
  url: string;
  pageType: string;
}) {
  const missingMetaTitle = !input.title;
  const missingMetaDescription = !input.description;
  const missingAltTags = (input.images || []).filter((image) => !image.alt).length;
  const score = Math.max(0, 100 - (missingMetaTitle ? 25 : 0) - (missingMetaDescription ? 25 : 0) - Math.min(30, missingAltTags * 5));

  return {
    pageUrl: input.url,
    pageType: input.pageType,
    score,
    missingMetaTitle,
    missingMetaDescription,
    missingAltTags,
    duplicateTitle: false,
    brokenLinks: 0,
    notes: score < 80 ? 'Needs SEO improvement' : 'Looks healthy',
    isActive: true,
  };
}

export async function POST() {
  try {
    await dbConnect();
    const [products, categories, collections, blogs, pages] = await Promise.all([
      Product.find({}).select('title slug seo images').lean(),
      Category.find({}).select('name slug seo image').lean(),
      Collection.find({}).select('name slug seo bannerImage').lean(),
      Blog.find({}).select('title slug seo featuredImage').lean(),
      CmsPage.find({}).select('title slug seo').lean(),
    ]);

    const audits = [
      ...products.map((item: any) => scoreAudit({ title: item.seo?.title || item.title, description: item.seo?.description, images: item.images || [], url: `/product/${item.slug}`, pageType: 'product' })),
      ...categories.map((item: any) => scoreAudit({ title: item.seo?.title || item.name, description: item.seo?.description, images: item.image ? [{ alt: item.name }] : [], url: `/category/${item.slug}`, pageType: 'category' })),
      ...collections.map((item: any) => scoreAudit({ title: item.seo?.title || item.name, description: item.seo?.description, images: item.bannerImage ? [{ alt: item.name }] : [], url: `/collection/${item.slug}`, pageType: 'collection' })),
      ...blogs.map((item: any) => scoreAudit({ title: item.seo?.title || item.title, description: item.seo?.description, images: item.featuredImage ? [{ alt: item.title }] : [], url: `/blog/${item.slug}`, pageType: 'blog' })),
      ...pages.map((item: any) => scoreAudit({ title: item.seo?.title || item.title, description: item.seo?.description, url: `/${item.slug}`, pageType: 'cms' })),
    ];

    await SeoAudit.deleteMany({});
    if (audits.length) await SeoAudit.insertMany(audits);
    return NextResponse.json({ success: true, data: { scanned: audits.length } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'SEO scan failed' }, { status: 500 });
  }
}
