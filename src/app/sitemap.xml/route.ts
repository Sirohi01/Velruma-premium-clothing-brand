import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import CmsPage from '@/models/CmsPage';
import Product from '@/models/Product';
import { getAppUrl } from '@/lib/env';

export const dynamic = 'force-dynamic';

function url(baseUrl: string, loc: string, updatedAt?: Date) {
  return `<url><loc>${baseUrl}${loc}</loc><lastmod>${(updatedAt || new Date()).toISOString()}</lastmod></url>`;
}

export async function GET() {
  const baseUrl = getAppUrl();
  await dbConnect();
  const [posts, pages, products] = await Promise.all([
    Blog.find({ status: 'published' }).select('slug updatedAt').lean(),
    CmsPage.find({ status: 'published' }).select('slug updatedAt').lean(),
    Product.find({ status: 'active' }).select('slug updatedAt').lean(),
  ]);

  const staticUrls = [
    '/',
    '/shop',
    '/collections',
    '/blog',
    '/lookbook',
    '/about',
    '/contact',
    '/faq',
    '/size-guide',
    '/return-policy',
    '/shipping-policy',
    '/privacy-policy',
    '/terms',
    '/track-order',
  ]
    .map((path) => url(baseUrl, path));
  const blogUrls = posts.map((post) => url(baseUrl, `/blog/${post.slug}`, post.updatedAt as Date));
  const pageUrls = pages
    .filter((page) => {
      const slug = String(page.slug || '');
      return slug && !slug.startsWith('admin') && !slug.startsWith('api') && !slug.startsWith('my-account');
    })
    .map((page) => url(baseUrl, `/${page.slug}`, page.updatedAt as Date));
  const productUrls = products.map((product) => url(baseUrl, `/product/${product.slug}`, product.updatedAt as Date));

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...staticUrls, ...blogUrls, ...pageUrls, ...productUrls].join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } }
  );
}
