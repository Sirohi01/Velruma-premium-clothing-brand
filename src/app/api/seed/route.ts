import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Role from '@/models/Role';
import User from '@/models/User';
import Setting from '@/models/Setting';
import CmsPage from '@/models/CmsPage';
import { hashPassword } from '@/lib/auth';
import { createFullPermissions, createViewOnlyPermissions } from '@/lib/permissions';
import { getRequiredEnv } from '@/lib/env';

// POST /api/seed — Initialize default data
export async function POST(request: NextRequest) {
  try {
    // Simple secret check to prevent unauthorized seeding
    const body = await request.json().catch(() => ({}));
    const secret = body.secret || request.headers.get('x-seed-secret');
    
    const seedSecret = getRequiredEnv('SEED_SECRET', process.env.JWT_SECRET || 'velruma-development-seed-secret');

    if (secret !== seedSecret) {
      return NextResponse.json(
        { success: false, error: 'Invalid seed secret' },
        { status: 403 }
      );
    }

    await dbConnect();

    // ────────────────────────────────────────
    // 1. Create Roles
    // ────────────────────────────────────────
    const roles = [
      {
        name: 'Super Admin',
        slug: 'super-admin',
        description: 'Full access to all modules and features',
        permissions: createFullPermissions(),
        isSystem: true,
      },
      {
        name: 'Admin',
        slug: 'admin',
        description: 'Administrative access with most permissions',
        permissions: createFullPermissions(),
        isSystem: true,
      },
      {
        name: 'Product Manager',
        slug: 'product-manager',
        description: 'Manages products, categories, and collections',
        permissions: {
          dashboard: { view: true },
          products: { view: true, create: true, edit: true, delete: true, export: true },
          categories: { view: true, create: true, edit: true, delete: true },
          collections: { view: true, create: true, edit: true, delete: true },
          inventory: { view: true, edit: true },
        },
        isSystem: true,
      },
      {
        name: 'Order Manager',
        slug: 'order-manager',
        description: 'Manages orders, returns, and invoices',
        permissions: {
          dashboard: { view: true },
          orders: { view: true, create: true, edit: true, changeStatus: true, export: true },
          returns: { view: true, create: true, edit: true, approve: true, changeStatus: true },
          invoices: { view: true, create: true, export: true },
          customers: { view: true },
        },
        isSystem: true,
      },
      {
        name: 'Customer',
        slug: 'customer',
        description: 'Regular customer with access to their own dashboard',
        permissions: createViewOnlyPermissions(['dashboard']),
        isSystem: true,
      },
    ];

    const createdRoles: Record<string, typeof Role.prototype> = {};

    for (const roleData of roles) {
      const existing = await Role.findOne({ slug: roleData.slug });
      if (!existing) {
        const role = await Role.create({
          ...roleData,
          permissions: new Map(Object.entries(roleData.permissions)),
        });
        createdRoles[roleData.slug] = role;
      } else {
        createdRoles[roleData.slug] = existing;
      }
    }

    // ────────────────────────────────────────
    // 2. Create Super Admin User
    // ────────────────────────────────────────
    const superAdminRole = createdRoles['super-admin'];
    const existingAdmin = await User.findOne({ email: 'admin@velruma.com' });

    if (!existingAdmin && superAdminRole) {
      const hashedPw = await hashPassword('admin123');
      await User.create({
        name: 'Super Admin',
        email: 'admin@velruma.com',
        password: hashedPw,
        phone: '+91 9999999999',
        role: superAdminRole._id,
        isActive: true,
        isEmailVerified: true,
      });
    }

    // ────────────────────────────────────────
    // 3. Create Default Settings
    // ────────────────────────────────────────
    const defaultSettings = [
      // Brand
      { group: 'brand', key: 'brand_name', value: 'VELRUMA', label: 'Brand Name', type: 'string', isPublic: true },
      { group: 'brand', key: 'brand_tagline', value: 'Elevate Your Style', label: 'Brand Tagline', type: 'string', isPublic: true },
      { group: 'brand', key: 'brand_logo', value: '', label: 'Brand Logo', type: 'image', isPublic: true },
      { group: 'brand', key: 'brand_favicon', value: '', label: 'Favicon', type: 'image', isPublic: true },
      { group: 'brand', key: 'brand_email', value: 'hello@velruma.com', label: 'Contact Email', type: 'string', isPublic: true },
      { group: 'brand', key: 'brand_phone', value: '+91 9999999999', label: 'Contact Phone', type: 'string', isPublic: true },
      { group: 'brand', key: 'brand_address', value: 'Mumbai, Maharashtra, India', label: 'Business Address', type: 'string', isPublic: true },
      { group: 'brand', key: 'contact_page_image', value: '', label: 'Contact Page Image', type: 'image', isPublic: true },

      // Theme
      { group: 'theme', key: 'primary_color', value: '#0F172A', label: 'Primary Color', type: 'color', isPublic: true },
      { group: 'theme', key: 'accent_color', value: '#C9A84C', label: 'Accent Color (Gold)', type: 'color', isPublic: true },
      { group: 'theme', key: 'secondary_color', value: '#1E293B', label: 'Secondary Color', type: 'color', isPublic: true },

      // GST
      { group: 'tax', key: 'gst_number', value: '', label: 'GST Number', type: 'string', isPublic: false },
      { group: 'tax', key: 'pan_number', value: '', label: 'PAN Number', type: 'string', isPublic: false },
      { group: 'tax', key: 'default_gst_rate', value: 12, label: 'Default GST Rate (%)', type: 'number', isPublic: false },

      // Invoice
      { group: 'invoice', key: 'invoice_prefix', value: 'VEL-INV', label: 'Invoice Prefix', type: 'string', isPublic: false },
      { group: 'invoice', key: 'estimate_prefix', value: 'VEL-EST', label: 'Estimate Prefix', type: 'string', isPublic: false },
      { group: 'invoice', key: 'proforma_prefix', value: 'VEL-PI', label: 'Proforma Invoice Prefix', type: 'string', isPublic: false },
      { group: 'invoice', key: 'receipt_prefix', value: 'VEL-REC', label: 'Receipt Prefix', type: 'string', isPublic: false },
      { group: 'invoice', key: 'credit_note_prefix', value: 'VEL-CN', label: 'Credit Note Prefix', type: 'string', isPublic: false },
      { group: 'invoice', key: 'debit_note_prefix', value: 'VEL-DN', label: 'Debit Note Prefix', type: 'string', isPublic: false },
      { group: 'invoice', key: 'purchase_prefix', value: 'VEL-PO', label: 'Purchase Order Prefix', type: 'string', isPublic: false },
      { group: 'invoice', key: 'order_prefix', value: 'VEL', label: 'Order Number Prefix', type: 'string', isPublic: false },

      // Bank
      { group: 'bank', key: 'bank_name', value: '', label: 'Bank Name', type: 'string', isPublic: false },
      { group: 'bank', key: 'bank_account', value: '', label: 'Account Number', type: 'string', isPublic: false },
      { group: 'bank', key: 'bank_ifsc', value: '', label: 'IFSC Code', type: 'string', isPublic: false },
      { group: 'bank', key: 'upi_id', value: '', label: 'UPI ID', type: 'string', isPublic: true },

      // Currency
      { group: 'general', key: 'currency', value: 'INR', label: 'Currency', type: 'string', isPublic: true },
      { group: 'general', key: 'currency_symbol', value: '₹', label: 'Currency Symbol', type: 'string', isPublic: true },

      // Shipping
      { group: 'shipping', key: 'free_shipping_threshold', value: 999, label: 'Free Shipping Above (₹)', type: 'number', isPublic: true },
      { group: 'shipping', key: 'shipping_charge', value: 79, label: 'Default Shipping Charge (₹)', type: 'number', isPublic: true },
      { group: 'shipping', key: 'cod_charge', value: 49, label: 'COD Extra Charge (₹)', type: 'number', isPublic: true },

      // SEO
      { group: 'seo', key: 'default_meta_title', value: 'VELRUMA — Premium Clothing Brand', label: 'Default Meta Title', type: 'string', isPublic: true },
      { group: 'seo', key: 'default_meta_description', value: 'Discover premium clothing at VELRUMA. Elevate your style with our curated collections of modern, luxury fashion.', label: 'Default Meta Description', type: 'string', isPublic: true },
      { group: 'seo', key: 'default_og_image', value: '', label: 'Default OG Image', type: 'image', isPublic: true },
    ];

    for (const setting of defaultSettings) {
      const existing = await Setting.findOne({ key: setting.key });
      if (!existing) {
        await Setting.create(setting as any);
      }
    }

    const defaultCmsPages = [
      {
        title: 'About VELRUMA',
        slug: 'about',
        type: 'page',
        status: 'published',
        excerpt: 'Premium everyday clothing crafted for comfort, confidence, and clean modern style.',
        content: [
          'VELRUMA is built around one simple idea: everyday clothing should feel premium without becoming complicated.',
          'Our pieces focus on comfortable silhouettes, dependable fabrics, sharp finishing, and versatile colors that move easily between daily wear, streetwear, travel, and relaxed occasions.',
          'From oversized essentials to curated seasonal drops, every product is managed through our catalog, inventory, quality, and customer support workflows so the brand can scale with consistency.',
        ].join('\n\n'),
        sections: [
          { type: 'text', title: 'Our Focus', body: 'Clean design, reliable quality, comfortable fits, and a shopping experience that feels direct and trustworthy.' },
          { type: 'text', title: 'What Makes Us Different', body: 'VELRUMA keeps operations connected: products, stock, orders, support, CMS, SEO, and customer experience all work from one backend.' },
        ],
        seo: {
          title: 'About VELRUMA',
          description: 'Learn about VELRUMA, a premium clothing brand focused on comfort, clean silhouettes, and modern everyday style.',
          keywords: ['velruma', 'about velruma', 'premium clothing'],
        },
      },
      {
        title: 'FAQ',
        slug: 'faq',
        type: 'faq',
        status: 'published',
        excerpt: 'Quick answers about orders, payments, shipping, sizing, returns, and support.',
        content: 'Find answers to common VELRUMA shopping questions below. For anything order-specific, raise a support ticket from your account.',
        sections: [
          {
            type: 'faq',
            title: 'Shopping Help',
            items: [
              { title: 'How do I place an order?', body: 'Choose your product, select size/color, add it to cart, and complete checkout with your shipping and payment details.' },
              { title: 'Do you support COD?', body: 'COD availability depends on admin settings and your serviceable location. Any COD charges are shown during checkout.' },
              { title: 'Can I upload UPI payment proof?', body: 'Yes. If manual UPI is enabled, you can upload payment proof during checkout for verification.' },
              { title: 'How can I track my order?', body: 'Use the Track Order page or open your customer account to see order status updates.' },
            ],
          },
          {
            type: 'faq',
            title: 'Returns & Support',
            items: [
              { title: 'How do returns work?', body: 'Eligible unused products can be returned within the return window. Raise a return request from your customer account.' },
              { title: 'How do I contact support?', body: 'Use the contact page or create a support ticket from your account for order-related help.' },
            ],
          },
        ],
        seo: {
          title: 'VELRUMA FAQ',
          description: 'Answers to common VELRUMA questions about orders, shipping, payment, returns, sizing, and support.',
          keywords: ['velruma faq', 'orders', 'returns', 'shipping'],
        },
      },
      {
        title: 'Size Guide',
        slug: 'size-guide',
        type: 'page',
        status: 'published',
        excerpt: 'Use measurements and fit notes before choosing your VELRUMA size.',
        content: [
          'VELRUMA products may include regular, relaxed, and oversized silhouettes. Always check product-specific measurements when available.',
          'Oversized styles are intentionally roomy. If you prefer a closer fit, consider sizing down based on shoulder, chest, and length measurements.',
        ].join('\n\n'),
        sections: [
          {
            type: 'text',
            title: 'How To Measure',
            body: 'Chest: measure across the fullest part. Shoulder: measure seam to seam. Length: measure from shoulder point to bottom hem. Compare these with the product measurements before checkout.',
          },
          {
            type: 'text',
            title: 'Fit Notes',
            body: 'Oversized: relaxed drop shoulder and extra body room. Regular: closer to standard sizing. If you are between sizes, choose based on your preferred fit.',
          },
        ],
        seo: {
          title: 'VELRUMA Size Guide',
          description: 'Find sizing guidance for VELRUMA oversized and regular fit clothing.',
          keywords: ['size guide', 'velruma sizing', 'oversized fit'],
        },
      },
      {
        title: 'Shipping Policy',
        slug: 'shipping-policy',
        type: 'policy',
        status: 'published',
        excerpt: 'Shipping timelines, charges, serviceability, and delivery updates for VELRUMA orders.',
        content: [
          'Orders are processed after checkout confirmation and payment verification where applicable.',
          'Shipping charges, COD charges, and free shipping thresholds are managed from admin settings and may vary by order value or location.',
          'Delivery timelines depend on courier serviceability, destination, and operational conditions.',
        ].join('\n\n'),
        sections: [
          { type: 'text', title: 'Order Processing', body: 'Orders are packed and handed over to courier partners after stock and payment checks are complete.' },
          { type: 'text', title: 'Delivery Updates', body: 'Customers can track their order status from the Track Order page or customer account.' },
        ],
        seo: {
          title: 'Shipping Policy',
          description: 'Read VELRUMA shipping policy, delivery timelines, charges, and order tracking information.',
          keywords: ['shipping policy', 'delivery', 'velruma shipping'],
        },
      },
      {
        title: 'Return Policy',
        slug: 'return-policy',
        type: 'policy',
        status: 'published',
        excerpt: 'Return eligibility, condition requirements, and return request process.',
        content: [
          'Eligible products can be returned within the configured return window if unused, unwashed, undamaged, and returned with original packaging.',
          'Return approval depends on product condition, order details, and policy rules configured by VELRUMA.',
        ].join('\n\n'),
        sections: [
          { type: 'text', title: 'Eligibility', body: 'Products must be unused, unwashed, and returned with tags and original packaging where applicable.' },
          { type: 'text', title: 'How To Raise A Return', body: 'Login to your customer account, open the order, and create a return request with the required reason and details.' },
        ],
        seo: {
          title: 'Return Policy',
          description: 'Read VELRUMA return policy, return eligibility, and return request process.',
          keywords: ['return policy', 'velruma returns', 'exchange'],
        },
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        type: 'policy',
        status: 'published',
        excerpt: 'How VELRUMA handles customer information, order data, and support details.',
        content: [
          'VELRUMA collects information required to process orders, manage customer accounts, provide support, and improve the shopping experience.',
          'Customer data may include name, contact details, shipping address, order history, support requests, and payment proof where manual payment is used.',
          'Sensitive payment gateway card storage is not handled by this website in the manual payment flow.',
        ].join('\n\n'),
        sections: [
          { type: 'text', title: 'Data Usage', body: 'We use customer information for order fulfillment, support, fraud prevention, analytics, and service improvement.' },
          { type: 'text', title: 'Customer Rights', body: 'Customers can contact support for account, order, or data-related queries.' },
        ],
        seo: {
          title: 'Privacy Policy',
          description: 'Read how VELRUMA handles customer data, order details, support information, and privacy practices.',
          keywords: ['privacy policy', 'customer data', 'velruma privacy'],
        },
      },
      {
        title: 'Terms & Conditions',
        slug: 'terms',
        type: 'policy',
        status: 'published',
        excerpt: 'Terms for using the VELRUMA website, placing orders, payments, shipping, and returns.',
        content: [
          'By using the VELRUMA website or placing an order, customers agree to product availability, pricing, payment verification, shipping timelines, return policy, and support processes.',
          'Product colors, images, measurements, and availability may vary slightly due to display settings, batch changes, and stock updates.',
        ].join('\n\n'),
        sections: [
          { type: 'text', title: 'Orders & Payments', body: 'Orders are confirmed after successful checkout and required payment verification. VELRUMA may cancel or hold orders if details are incomplete or suspicious.' },
          { type: 'text', title: 'Product Information', body: 'We aim to keep product details accurate, but minor variations in color, fit, and measurements can occur.' },
        ],
        seo: {
          title: 'Terms & Conditions',
          description: 'Read VELRUMA terms and conditions for website usage, orders, payments, shipping, and returns.',
          keywords: ['terms and conditions', 'velruma terms'],
        },
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
        seo: {
          title: 'VELRUMA Lookbook',
          description: 'Explore VELRUMA lookbook stories, campaign styling, and seasonal outfit inspiration.',
          keywords: ['lookbook', 'velruma outfits', 'streetwear styling'],
        },
      },
    ];

    let cmsPages = 0;
    for (const page of defaultCmsPages) {
      const result = await CmsPage.findOneAndUpdate(
        { slug: page.slug },
        { $setOnInsert: page },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (result) cmsPages += 1;
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        roles: Object.keys(createdRoles).length,
        settings: defaultSettings.length,
        cmsPages,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Seed failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
