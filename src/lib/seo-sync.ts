import CmsPage from '@/models/CmsPage';
import SeoPage from '@/models/SeoPage';

type SeoLike = Record<string, any>;

export function scoreSeo(body: SeoLike, keywords: string[] = []) {
  const title = body.title || '';
  const description = body.description || '';
  let score = 30;
  if (title.length >= 30 && title.length <= 65) score += 25;
  if (description.length >= 90 && description.length <= 160) score += 25;
  if (keywords.length > 0) score += 10;
  if (body.canonicalUrl) score += 5;
  if (body.ogTitle && body.ogDescription && body.ogImage) score += 10;
  if (body.twitterTitle && body.twitterDescription && (body.twitterImage || body.ogImage)) score += 5;
  if (body.schemaType || body.schemaJson) score += 5;
  return Math.min(100, score);
}

function cmsPath(slug: string) {
  return slug === 'home' ? '/' : `/${slug}`;
}

function pathToSlug(path: string) {
  const clean = String(path || '').split('?')[0].replace(/^\/+|\/+$/g, '');
  if (!clean || clean.includes('[')) return null;
  return clean;
}

function normalizeKeywords(value: unknown) {
  return Array.isArray(value)
    ? value.map(String).map((item) => item.trim()).filter(Boolean)
    : String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

export function normalizeSeoPayload(body: SeoLike) {
  const keywords = normalizeKeywords(body.keywords);
  return {
    path: body.path,
    title: body.title,
    description: body.description,
    keywords,
    metaAuthor: body.metaAuthor,
    metaViewport: body.metaViewport,
    ogTitle: body.ogTitle,
    ogDescription: body.ogDescription,
    ogImage: body.ogImage,
    ogType: body.ogType || 'website',
    ogUrl: body.ogUrl,
    twitterCard: body.twitterCard || 'summary_large_image',
    twitterTitle: body.twitterTitle,
    twitterDescription: body.twitterDescription,
    twitterImage: body.twitterImage || body.ogImage,
    twitterSite: body.twitterSite,
    twitterCreator: body.twitterCreator,
    canonicalUrl: body.canonicalUrl,
    robots: body.robots || 'index,follow',
    schemaType: body.schemaType || 'WebPage',
    schemaJson: body.schemaJson,
    breadcrumbsJson: body.breadcrumbsJson,
    sitemapChangefreq: body.sitemapChangefreq || 'weekly',
    sitemapPriority: Number(body.sitemapPriority ?? 0.7),
    hreflang: Array.isArray(body.hreflang) ? body.hreflang : [],
    redirectTo: body.redirectTo,
    isRedirect: Boolean(body.isRedirect),
  };
}

function seoFromCms(page: any) {
  const seo = page.seo || {};
  const keywords = normalizeKeywords(seo.keywords);
  return {
    path: cmsPath(page.slug),
    title: seo.title || page.title,
    description: seo.description || page.excerpt || page.content || page.title,
    keywords,
    ogImage: seo.ogImage || page.heroImage || '',
    canonicalUrl: seo.canonicalUrl || '',
    robots: seo.robots || 'index,follow',
    ogTitle: seo.ogTitle || seo.title || page.title,
    ogDescription: seo.ogDescription || seo.description || page.excerpt || '',
    ogType: seo.ogType || 'website',
    ogUrl: seo.ogUrl || seo.canonicalUrl || '',
    twitterCard: seo.twitterCard || 'summary_large_image',
    twitterTitle: seo.twitterTitle || seo.ogTitle || seo.title || page.title,
    twitterDescription: seo.twitterDescription || seo.ogDescription || seo.description || page.excerpt || '',
    twitterImage: seo.twitterImage || seo.ogImage || page.heroImage || '',
    twitterSite: seo.twitterSite || '',
    twitterCreator: seo.twitterCreator || '',
    schemaType: seo.schemaType || (page.type === 'faq' ? 'FAQPage' : page.type === 'lookbook' ? 'CollectionPage' : 'WebPage'),
    schemaJson: seo.schemaJson || '',
    breadcrumbsJson: seo.breadcrumbsJson || '',
    sitemapChangefreq: seo.sitemapChangefreq || 'weekly',
    sitemapPriority: seo.sitemapPriority ?? 0.7,
    hreflang: seo.hreflang || [],
  };
}

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function mergeSeoPayload(existing: SeoLike | null, incoming: SeoLike) {
  if (!existing) return incoming;
  const merged = { ...incoming };
  for (const key of [
    'canonicalUrl',
    'ogImage',
    'ogTitle',
    'ogDescription',
    'ogType',
    'ogUrl',
    'twitterCard',
    'twitterTitle',
    'twitterDescription',
    'twitterImage',
    'twitterSite',
    'twitterCreator',
    'schemaType',
    'schemaJson',
    'breadcrumbsJson',
    'sitemapChangefreq',
    'sitemapPriority',
    'hreflang',
    'robots',
  ]) {
    if (!hasValue(incoming[key]) && hasValue(existing[key])) {
      merged[key] = existing[key];
    }
  }
  return merged;
}

function cmsSeoFromSeo(page: SeoLike) {
  const normalized = normalizeSeoPayload(page);
  return {
    title: normalized.title,
    description: normalized.description,
    keywords: normalized.keywords,
    ogImage: normalized.ogImage,
    canonicalUrl: normalized.canonicalUrl,
    ogTitle: normalized.ogTitle,
    ogDescription: normalized.ogDescription,
    ogType: normalized.ogType,
    ogUrl: normalized.ogUrl,
    twitterCard: normalized.twitterCard,
    twitterTitle: normalized.twitterTitle,
    twitterDescription: normalized.twitterDescription,
    twitterImage: normalized.twitterImage,
    twitterSite: normalized.twitterSite,
    twitterCreator: normalized.twitterCreator,
    schemaType: normalized.schemaType,
    schemaJson: normalized.schemaJson,
    breadcrumbsJson: normalized.breadcrumbsJson,
    sitemapChangefreq: normalized.sitemapChangefreq,
    sitemapPriority: normalized.sitemapPriority,
    hreflang: normalized.hreflang || [],
    robots: normalized.robots,
  };
}

export async function syncCmsPageToSeo(page: any) {
  if (!page?.slug) return;
  const seoPayload = seoFromCms(page);
  const existing = await SeoPage.findOne({ path: seoPayload.path }).lean();
  const mergedPayload = mergeSeoPayload(existing, seoPayload);
  await SeoPage.findOneAndUpdate(
    { path: mergedPayload.path },
    { ...mergedPayload, score: scoreSeo(mergedPayload, mergedPayload.keywords) },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );
}

export async function syncAllCmsSeoToSeoPages() {
  const pages = await CmsPage.find({ status: { $ne: 'archived' } });
  for (const page of pages) {
    await syncCmsPageToSeo(page);
  }
}

export async function syncSeoPageToCms(page: SeoLike) {
  const slug = pathToSlug(page.path);
  if (!slug) return;
  const cms = await CmsPage.findOne({ slug });
  if (!cms) return;
  cms.seo = { ...(cms.seo || {}), ...cmsSeoFromSeo(page) };
  cms.markModified('seo');
  await cms.save();
}
