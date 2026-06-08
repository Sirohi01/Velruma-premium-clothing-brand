const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

const CmsPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      enum: ['page', 'policy', 'faq', 'lookbook', 'home-banner', 'popup', 'testimonial'],
      default: 'page',
    },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    heroImage: String,
    heroImageAspectRatio: { type: String, default: '16 / 9' },
    heroImagePosition: { type: String, default: 'center' },
    heroImageFit: { type: String, enum: ['cover', 'contain'], default: 'contain' },
    heroVideo: String,
    heroVideoAspectRatio: { type: String, default: '16 / 9' },
    heroVideoPosition: { type: String, default: 'center' },
    heroVideoFit: { type: String, enum: ['cover', 'contain'], default: 'contain' },
    excerpt: String,
    content: String,
    sections: [{
      type: { type: String, enum: ['text', 'image', 'faq', 'gallery', 'banner', 'testimonial'], default: 'text' },
      title: String,
      body: String,
      image: String,
      imageAspectRatio: { type: String, default: '16 / 9' },
      imagePosition: { type: String, default: 'center' },
      video: String,
      videoAspectRatio: { type: String, default: '16 / 9' },
      videoPosition: { type: String, default: 'center' },
      mediaFit: { type: String, enum: ['cover', 'contain'], default: 'cover' },
      items: [{
        title: String,
        body: String,
        image: String,
        link: String,
      }],
    }],
    seo: {
      title: String,
      description: String,
      keywords: [{ type: String }],
      ogImage: String,
      canonicalUrl: String,
      ogTitle: String,
      ogDescription: String,
      twitterTitle: String,
      twitterDescription: String,
      schemaType: String,
      schemaJson: String,
      robots: String,
    },
  },
  { timestamps: true }
);

const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', CmsPageSchema);

const pages = [
  {
    title: 'About VELRUMA',
    slug: 'about',
    type: 'page',
    status: 'published',
    heroImage: '',
    excerpt: 'Premium everyday clothing crafted for comfort, confidence, and clean modern style.',
    content: [
      'VELRUMA is built around one simple idea: everyday clothing should feel premium without becoming complicated.',
      'Our pieces focus on comfortable silhouettes, dependable fabrics, sharp finishing, and versatile colors that move easily between daily wear, streetwear, travel, and relaxed occasions.',
      'From oversized essentials to curated seasonal drops, every product is managed through connected catalog, inventory, quality, and customer support workflows.',
    ].join('\n\n'),
    sections: [
      { type: 'text', title: 'Our Focus', body: 'Clean design, reliable quality, comfortable fits, and a shopping experience that feels direct and trustworthy.', image: '', items: [] },
      { type: 'text', title: 'What Makes Us Different', body: 'VELRUMA keeps operations connected: products, stock, orders, support, CMS, SEO, and customer experience all work from one backend.', image: '', items: [] },
      { type: 'text', title: 'Built For Daily Wear', body: 'Every collection is planned around pieces people can actually wear often: soft fabrics, easy silhouettes, and colors that pair well.', image: '', items: [] },
      {
        type: 'gallery',
        title: 'Brand Pillars',
        body: 'The VELRUMA experience is built around three practical promises.',
        image: '',
        items: [
          { title: 'Comfort First', body: 'Soft hand-feel, relaxed movement, and silhouettes that do not fight the body.', image: '', link: '' },
          { title: 'Clean Styling', body: 'Minimal graphics, premium logo placement, and neutral colors that work with more outfits.', image: '', link: '' },
          { title: 'Operational Trust', body: 'Inventory, orders, support, returns, SEO, and CMS are managed from one connected backend.', image: '', link: '' },
        ],
      },
    ],
    seo: {
      title: 'About VELRUMA',
      description: 'Learn about VELRUMA, a premium clothing brand focused on comfort, clean silhouettes, and modern everyday style.',
      keywords: ['velruma', 'about velruma', 'premium clothing'],
      ogImage: '',
    },
  },
  {
    title: 'FAQ',
    slug: 'faq',
    type: 'faq',
    status: 'published',
    heroImage: '',
    excerpt: 'Quick answers about orders, payments, shipping, sizing, returns, and support.',
    content: 'Find answers to common VELRUMA shopping questions below. For anything order-specific, raise a support ticket from your account.',
    sections: [
      {
        type: 'faq',
        title: 'Shopping Help',
        body: '',
        image: '',
        items: [
          { title: 'How do I place an order?', body: 'Choose your product, select size/color, add it to cart, and complete checkout with your shipping and payment details.', image: '', link: '' },
          { title: 'Do you support COD?', body: 'COD availability depends on admin settings and your serviceable location. Any COD charges are shown during checkout.', image: '', link: '' },
          { title: 'Can I upload UPI payment proof?', body: 'Yes. If manual UPI is enabled, you can upload payment proof during checkout for verification.', image: '', link: '' },
          { title: 'How can I track my order?', body: 'Use the Track Order page or open your customer account to see order status updates.', image: '', link: '' },
          { title: 'Are product images uploaded from admin?', body: 'Yes. Product, category, collection, CMS, SEO, and homepage images are uploaded through admin instead of pasting external URLs.', image: '', link: '' },
        ],
      },
      {
        type: 'faq',
        title: 'Returns & Support',
        body: '',
        image: '',
        items: [
          { title: 'How do returns work?', body: 'Eligible unused products can be returned within the return window. Raise a return request from your customer account.', image: '', link: '' },
          { title: 'How do I contact support?', body: 'Use the contact page or create a support ticket from your account for order-related help.', image: '', link: '' },
          { title: 'Where can I see invoices?', body: 'Customer invoices and order history are available inside the My Account area after login.', image: '', link: '' },
        ],
      },
    ],
    seo: {
      title: 'VELRUMA FAQ',
      description: 'Answers to common VELRUMA questions about orders, shipping, payment, returns, sizing, and support.',
      keywords: ['velruma faq', 'orders', 'returns', 'shipping'],
      ogImage: '',
    },
  },
  {
    title: 'Size Guide',
    slug: 'size-guide',
    type: 'page',
    status: 'published',
    heroImage: '',
    excerpt: 'Use measurements and fit notes before choosing your VELRUMA size.',
    content: [
      'VELRUMA products may include regular, relaxed, and oversized silhouettes. Always check product-specific measurements when available.',
      'Oversized styles are intentionally roomy. If you prefer a closer fit, consider sizing down based on shoulder, chest, and length measurements.',
    ].join('\n\n'),
    sections: [
      { type: 'text', title: 'How To Measure', body: 'Chest: measure across the fullest part. Shoulder: measure seam to seam. Length: measure from shoulder point to bottom hem. Compare these with the product measurements before checkout.', image: '', items: [] },
      { type: 'text', title: 'Fit Notes', body: 'Oversized: relaxed drop shoulder and extra body room. Regular: closer to standard sizing. If you are between sizes, choose based on your preferred fit.', image: '', items: [] },
      {
        type: 'gallery',
        title: 'Quick Fit Reference',
        body: 'Use these notes with the measurements shown on each product page.',
        image: '',
        items: [
          { title: 'Oversized T-Shirt', body: 'Drop shoulder, relaxed chest, longer sleeve fall. Choose usual size for intended streetwear fit.', image: '', link: '' },
          { title: 'Regular Fit', body: 'Closer shoulder placement and cleaner body shape. Good for sharper everyday styling.', image: '', link: '' },
          { title: 'Layering Fit', body: 'Choose one size up when styling over inner layers or when you prefer more movement.', image: '', link: '' },
        ],
      },
      {
        type: 'faq',
        title: 'Size Questions',
        body: '',
        image: '',
        items: [
          { title: 'Should I size down for oversized t-shirts?', body: 'If you want a cleaner regular fit, size down. If you want the intended oversized silhouette, choose your usual size.', image: '', link: '' },
          { title: 'What if I am between sizes?', body: 'Choose the larger size for relaxed comfort or the smaller size for a sharper fit.', image: '', link: '' },
        ],
      },
    ],
    seo: {
      title: 'VELRUMA Size Guide',
      description: 'Find sizing guidance for VELRUMA oversized and regular fit clothing.',
      keywords: ['size guide', 'velruma sizing', 'oversized fit'],
      ogImage: '',
    },
  },
  {
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    type: 'policy',
    status: 'published',
    heroImage: '',
    excerpt: 'Shipping timelines, charges, serviceability, and delivery updates for VELRUMA orders.',
    content: [
      'Orders are processed after checkout confirmation and payment verification where applicable.',
      'Shipping charges, COD charges, and free shipping thresholds are managed from admin settings and may vary by order value or location.',
      'Delivery timelines depend on courier serviceability, destination, and operational conditions.',
    ].join('\n\n'),
    sections: [
      { type: 'text', title: 'Order Processing', body: 'Orders are packed and handed over to courier partners after stock and payment checks are complete.', image: '', items: [] },
      { type: 'text', title: 'Delivery Updates', body: 'Customers can track their order status from the Track Order page or customer account.', image: '', items: [] },
      { type: 'text', title: 'Shipping Charges', body: 'Shipping and COD charges are calculated using admin settings and may change based on order value or policy updates.', image: '', items: [] },
      {
        type: 'faq',
        title: 'Shipping Questions',
        body: '',
        image: '',
        items: [
          { title: 'When will my order be packed?', body: 'Orders are usually queued for packing after payment/order verification and stock confirmation.', image: '', link: '' },
          { title: 'Why can delivery time vary?', body: 'Courier capacity, destination pincode, holidays, and weather can affect final delivery timelines.', image: '', link: '' },
          { title: 'Where do I get tracking details?', body: 'Tracking details are shown on the Track Order page and in the customer account when available.', image: '', link: '' },
        ],
      },
    ],
    seo: {
      title: 'Shipping Policy',
      description: 'Read VELRUMA shipping policy, delivery timelines, charges, and order tracking information.',
      keywords: ['shipping policy', 'delivery', 'velruma shipping'],
      ogImage: '',
    },
  },
  {
    title: 'Return Policy',
    slug: 'return-policy',
    type: 'policy',
    status: 'published',
    heroImage: '',
    excerpt: 'Return eligibility, condition requirements, and return request process.',
    content: [
      'Eligible products can be returned within the configured return window if unused, unwashed, undamaged, and returned with original packaging.',
      'Return approval depends on product condition, order details, and policy rules configured by VELRUMA.',
    ].join('\n\n'),
    sections: [
      { type: 'text', title: 'Eligibility', body: 'Products must be unused, unwashed, and returned with tags and original packaging where applicable.', image: '', items: [] },
      { type: 'text', title: 'How To Raise A Return', body: 'Login to your customer account, open the order, and create a return request with the required reason and details.', image: '', items: [] },
      { type: 'text', title: 'Verification', body: 'Return requests are reviewed by the support/admin team before approval, pickup, replacement, or refund decisions.', image: '', items: [] },
      {
        type: 'gallery',
        title: 'Return Flow',
        body: 'A clean return process helps support verify the request faster.',
        image: '',
        items: [
          { title: '1. Raise Request', body: 'Open the order from My Account and submit the return reason.', image: '', link: '' },
          { title: '2. Admin Review', body: 'Support checks eligibility, product details, and order status.', image: '', link: '' },
          { title: '3. Resolution', body: 'Approved cases move toward pickup, replacement, refund, or support follow-up.', image: '', link: '' },
        ],
      },
    ],
    seo: {
      title: 'Return Policy',
      description: 'Read VELRUMA return policy, return eligibility, and return request process.',
      keywords: ['return policy', 'velruma returns', 'exchange'],
      ogImage: '',
    },
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    type: 'policy',
    status: 'published',
    heroImage: '',
    excerpt: 'How VELRUMA handles customer information, order data, and support details.',
    content: [
      'VELRUMA collects information required to process orders, manage customer accounts, provide support, and improve the shopping experience.',
      'Customer data may include name, contact details, shipping address, order history, support requests, and payment proof where manual payment is used.',
      'Sensitive payment gateway card storage is not handled by this website in the manual payment flow.',
    ].join('\n\n'),
    sections: [
      { type: 'text', title: 'Data Usage', body: 'We use customer information for order fulfillment, support, fraud prevention, analytics, and service improvement.', image: '', items: [] },
      { type: 'text', title: 'Customer Rights', body: 'Customers can contact support for account, order, or data-related queries.', image: '', items: [] },
      { type: 'text', title: 'Security', body: 'Admin access, authentication, and operational logs help protect business and customer workflows.', image: '', items: [] },
      {
        type: 'faq',
        title: 'Privacy Notes',
        body: '',
        image: '',
        items: [
          { title: 'Do you store order data?', body: 'Yes, order history is stored so customers and admins can manage invoices, returns, and support.', image: '', link: '' },
          { title: 'Do you use uploaded payment proof?', body: 'Uploaded proof is used for manual payment verification where that workflow is enabled.', image: '', link: '' },
          { title: 'Can I ask about my data?', body: 'Yes. Contact support for account or data-related queries.', image: '', link: '' },
        ],
      },
    ],
    seo: {
      title: 'Privacy Policy',
      description: 'Read how VELRUMA handles customer data, order details, support information, and privacy practices.',
      keywords: ['privacy policy', 'customer data', 'velruma privacy'],
      ogImage: '',
    },
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms',
    type: 'policy',
    status: 'published',
    heroImage: '',
    excerpt: 'Terms for using the VELRUMA website, placing orders, payments, shipping, and returns.',
    content: [
      'By using the VELRUMA website or placing an order, customers agree to product availability, pricing, payment verification, shipping timelines, return policy, and support processes.',
      'Product colors, images, measurements, and availability may vary slightly due to display settings, batch changes, and stock updates.',
    ].join('\n\n'),
    sections: [
      { type: 'text', title: 'Orders & Payments', body: 'Orders are confirmed after successful checkout and required payment verification. VELRUMA may cancel or hold orders if details are incomplete or suspicious.', image: '', items: [] },
      { type: 'text', title: 'Product Information', body: 'We aim to keep product details accurate, but minor variations in color, fit, and measurements can occur.', image: '', items: [] },
      { type: 'text', title: 'Policy Updates', body: 'VELRUMA may update these terms as store operations, shipping, payments, or customer workflows evolve.', image: '', items: [] },
      {
        type: 'gallery',
        title: 'Customer Responsibilities',
        body: 'These simple checks keep orders smooth and support faster.',
        image: '',
        items: [
          { title: 'Check Details', body: 'Review size, color, address, phone number, and payment mode before placing the order.', image: '', link: '' },
          { title: 'Keep Proof Ready', body: 'For manual payment workflows, upload clear proof for faster verification.', image: '', link: '' },
          { title: 'Raise Support Early', body: 'For order changes or concerns, contact support before dispatch where possible.', image: '', link: '' },
        ],
      },
    ],
    seo: {
      title: 'Terms & Conditions',
      description: 'Read VELRUMA terms and conditions for website usage, orders, payments, shipping, and returns.',
      keywords: ['terms and conditions', 'velruma terms'],
      ogImage: '',
    },
  },
  {
    title: 'Lookbook',
    slug: 'lookbook',
    type: 'lookbook',
    status: 'published',
    heroImage: '',
    excerpt: 'Campaign visuals, styling stories, and seasonal VELRUMA outfit ideas.',
    content: 'Use this page to publish campaign images, seasonal styling stories, and curated outfit edits from the CMS.',
    sections: [
      {
        type: 'gallery',
        title: 'Style Stories',
        body: 'Upload lookbook visuals in CMS sections. Each gallery item can carry a title and styling note.',
        image: '',
        items: [
          { title: 'Oversized Essentials', body: 'Relaxed silhouettes for everyday streetwear styling.', image: '', link: '' },
          { title: 'Neutral Layers', body: 'Clean tones designed for easy outfit building.', image: '', link: '' },
          { title: 'Weekend Fits', body: 'Comfort-led pieces for travel, cafes, and daily movement.', image: '', link: '' },
          { title: 'Signature Logo Drop', body: 'Minimal logo placement with premium blank-space styling for a cleaner brand look.', image: '', link: '' },
          { title: 'Monochrome Styling', body: 'White, black, grey, and neutral foundations built for repeat wear.', image: '', link: '' },
          { title: 'Everyday Pairing', body: 'Oversized tees paired with cargos, denims, shorts, and relaxed sneakers.', image: '', link: '' },
        ],
      },
      {
        type: 'text',
        title: 'How To Use This Lookbook',
        body: 'Upload real campaign images from admin CMS sections. Keep all lookbook visuals in similar aspect ratios so mobile and desktop layouts stay clean.',
        image: '',
        items: [],
      },
    ],
    seo: {
      title: 'VELRUMA Lookbook',
      description: 'Explore VELRUMA lookbook stories, campaign styling, and seasonal outfit inspiration.',
      keywords: ['lookbook', 'velruma outfits', 'streetwear styling'],
      ogImage: '',
    },
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI);

  let created = 0;
  let updated = 0;

  for (const page of pages) {
    const existing = await CmsPage.findOne({ slug: page.slug }).select('_id').lean();
    await CmsPage.findOneAndUpdate(
      { slug: page.slug },
      { $set: page },
      { upsert: true, runValidators: true, returnDocument: 'after' }
    );

    if (existing) updated += 1;
    else created += 1;
  }

  console.log(`CMS seed complete. Created: ${created}, Updated: ${updated}, Total: ${pages.length}`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('CMS seed failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
