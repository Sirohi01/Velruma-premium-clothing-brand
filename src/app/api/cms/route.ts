import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CmsPage from '@/models/CmsPage';
import { syncCmsPageToSeo } from '@/lib/seo-sync';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const defaultCmsPages = [
  {
    title: 'About VELRUMA',
    slug: 'about',
    type: 'page',
    status: 'published',
    excerpt: 'Premium everyday clothing crafted for comfort, confidence, and clean modern style.',
    content: 'VELRUMA is built around one simple idea: everyday clothing should feel premium without becoming complicated.\n\nOur pieces focus on comfortable silhouettes, dependable fabrics, sharp finishing, and versatile colors that move easily between daily wear, streetwear, travel, and relaxed occasions.',
    sections: [
      { type: 'text', title: 'Our Focus', body: 'Clean design, reliable quality, comfortable fits, and a shopping experience that feels direct and trustworthy.' },
      { type: 'text', title: 'What Makes Us Different', body: 'Products, stock, orders, support, CMS, SEO, and customer experience all work from one backend.' },
    ],
    seo: { title: 'About VELRUMA', description: 'Learn about VELRUMA, a premium clothing brand focused on comfort and modern everyday style.', keywords: ['velruma', 'premium clothing'] },
  },
  {
    title: 'FAQ',
    slug: 'faq',
    type: 'faq',
    status: 'published',
    excerpt: 'Quick answers about orders, payments, shipping, sizing, returns, and support.',
    content: 'Find answers to common VELRUMA shopping questions below.',
    sections: [
      {
        type: 'faq',
        title: 'Shopping Help',
        items: [
          { title: 'How do I place an order?', body: 'Choose your product, select size/color, add it to cart, and complete checkout.' },
          { title: 'Do you support COD?', body: 'COD availability depends on admin settings and serviceable location.' },
          { title: 'How can I track my order?', body: 'Use the Track Order page or your customer account.' },
        ],
      },
    ],
    seo: { title: 'VELRUMA FAQ', description: 'Answers to common VELRUMA questions about orders, shipping, returns, and support.', keywords: ['faq', 'orders', 'returns'] },
  },
  {
    title: 'Size Guide',
    slug: 'size-guide',
    type: 'page',
    status: 'published',
    excerpt: 'Use measurements and fit notes before choosing your VELRUMA size.',
    content: 'VELRUMA products may include regular, relaxed, and oversized silhouettes. Always check product-specific measurements when available.',
    sections: [
      { type: 'text', title: 'How To Measure', body: 'Chest: measure across the fullest part. Shoulder: measure seam to seam. Length: measure from shoulder point to bottom hem.' },
      { type: 'text', title: 'Fit Notes', body: 'Oversized styles are intentionally roomy. If you prefer a closer fit, consider sizing down.' },
    ],
    seo: { title: 'VELRUMA Size Guide', description: 'Sizing guidance for VELRUMA oversized and regular fit clothing.', keywords: ['size guide', 'oversized fit'] },
  },
  {
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    type: 'policy',
    status: 'published',
    excerpt: 'Shipping timelines, charges, serviceability, and delivery updates for VELRUMA orders.',
    content: 'Orders are processed after checkout confirmation and payment verification where applicable.\n\nShipping charges, COD charges, and free shipping thresholds are managed from admin settings.',
    sections: [
      { type: 'text', title: 'Order Processing', body: 'Orders are packed and handed over to courier partners after stock and payment checks are complete.' },
      { type: 'text', title: 'Delivery Updates', body: 'Customers can track order status from the Track Order page or customer account.' },
    ],
    seo: { title: 'Shipping Policy', description: 'VELRUMA shipping policy, delivery timelines, charges, and tracking information.', keywords: ['shipping', 'delivery'] },
  },
  {
    title: 'Return Policy',
    slug: 'return-policy',
    type: 'policy',
    status: 'published',
    excerpt: 'Return eligibility, condition requirements, and return request process.',
    content: 'Eligible products can be returned within the configured return window if unused, unwashed, undamaged, and returned with original packaging.',
    sections: [
      { type: 'text', title: 'Eligibility', body: 'Products must be unused, unwashed, and returned with tags and original packaging where applicable.' },
      { type: 'text', title: 'How To Raise A Return', body: 'Login to your customer account, open the order, and create a return request.' },
    ],
    seo: { title: 'Return Policy', description: 'VELRUMA return policy, return eligibility, and return request process.', keywords: ['returns', 'exchange'] },
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    type: 'policy',
    status: 'published',
    excerpt: 'How VELRUMA handles customer information, order data, and support details.',
    content: 'VELRUMA collects information required to process orders, manage customer accounts, provide support, and improve the shopping experience.',
    sections: [
      { type: 'text', title: 'Data Usage', body: 'Customer information is used for order fulfillment, support, fraud prevention, analytics, and service improvement.' },
      { type: 'text', title: 'Customer Rights', body: 'Customers can contact support for account, order, or data-related queries.' },
    ],
    seo: { title: 'Privacy Policy', description: 'How VELRUMA handles customer data, order details, and support information.', keywords: ['privacy', 'customer data'] },
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms',
    type: 'policy',
    status: 'published',
    excerpt: 'Terms for using the VELRUMA website, placing orders, payments, shipping, and returns.',
    content: 'By using the VELRUMA website or placing an order, customers agree to product availability, pricing, payment verification, shipping timelines, return policy, and support processes.',
    sections: [
      { type: 'text', title: 'Orders & Payments', body: 'Orders are confirmed after successful checkout and required payment verification.' },
      { type: 'text', title: 'Product Information', body: 'Minor variations in color, fit, and measurements can occur.' },
    ],
    seo: { title: 'Terms & Conditions', description: 'VELRUMA terms for website usage, orders, payments, shipping, and returns.', keywords: ['terms', 'conditions'] },
  },
  {
    title: 'Lookbook',
    slug: 'lookbook',
    type: 'lookbook',
    status: 'published',
    excerpt: 'Campaign visuals, styling stories, and seasonal VELRUMA outfit ideas.',
    content: 'Use this page to publish campaign images, seasonal styling stories, and curated outfit edits from the CMS.',
    sections: [
      {
        type: 'gallery',
        title: 'Style Stories',
        body: 'Upload lookbook visuals in CMS sections. Each gallery item can carry a title and styling note.',
        items: [
          { title: 'Oversized Essentials', body: 'Relaxed silhouettes for everyday streetwear styling.' },
          { title: 'Neutral Layers', body: 'Clean tones designed for easy outfit building.' },
          { title: 'Weekend Fits', body: 'Comfort-led pieces for travel, cafes, and daily movement.' },
        ],
      },
    ],
    seo: { title: 'VELRUMA Lookbook', description: 'VELRUMA lookbook stories, campaign styling, and outfit inspiration.', keywords: ['lookbook', 'styling'] },
  },
];

async function ensureDefaultCmsPages() {
  const count = await CmsPage.countDocuments();
  if (count > 0) return;

  await CmsPage.insertMany(defaultCmsPages, { ordered: false });
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await ensureDefaultCmsPages();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const publicOnly = searchParams.get('public') === 'true';
    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (publicOnly) query.status = 'published';
    const pages = await CmsPage.find(query).sort({ type: 1, updatedAt: -1 });
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error('CMS GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const page = await CmsPage.create({ ...body, slug: body.slug || slugify(body.title || 'page') });
    await syncCmsPageToSeo(page);
    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error: any) {
    console.error('CMS POST error:', error);
    if (error.code === 11000) return NextResponse.json({ success: false, error: 'Page slug already exists' }, { status: 400 });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
