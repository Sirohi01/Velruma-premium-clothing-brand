import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';

export const dynamic = 'force-dynamic';

type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'image' | 'color' | 'select' | 'textarea';

type DefaultSetting = {
  group: string;
  key: string;
  value: unknown;
  label: string;
  description?: string;
  type: SettingType;
  options?: string[];
  isPublic: boolean;
};

type SettingPayload = {
  group?: string;
  key?: string;
  value?: unknown;
  label?: string;
  description?: string;
  type?: SettingType;
  options?: string[];
  isPublic?: boolean;
};

const defaultSettings: DefaultSetting[] = [
  { group: 'brand', key: 'brand_name', value: 'VELRUMA', label: 'Brand Name', type: 'string', isPublic: true },
  { group: 'brand', key: 'brand_tagline', value: 'Elevate Your Style', label: 'Brand Tagline', type: 'string', isPublic: true },
  { group: 'brand', key: 'brand_logo', value: '', label: 'Brand Logo', type: 'image', isPublic: true },
  { group: 'brand', key: 'brand_favicon', value: '', label: 'Favicon', type: 'image', isPublic: true },
  { group: 'brand', key: 'brand_email', value: 'hello@velruma.com', label: 'Contact Email', type: 'string', isPublic: true },
  { group: 'brand', key: 'brand_phone', value: '+91 9999999999', label: 'Contact Phone', type: 'string', isPublic: true },
  { group: 'brand', key: 'brand_address', value: 'Mumbai, Maharashtra, India', label: 'Business Address', type: 'string', isPublic: true },
  {
    group: 'brand',
    key: 'footer_social_links',
    value: JSON.stringify([
      { platform: 'instagram', label: 'Instagram', url: '' },
      { platform: 'facebook', label: 'Facebook', url: '' },
      { platform: 'youtube', label: 'YouTube', url: '' },
      { platform: 'twitter', label: 'X / Twitter', url: '' },
    ], null, 2),
    label: 'Footer Social Links',
    description: 'Add social profile URLs for footer icons.',
    type: 'json',
    isPublic: true,
  },
  { group: 'brand', key: 'header_supported_label', value: 'SUPPORTED BY', label: 'Header Supported Label', type: 'string', isPublic: true },
  {
    group: 'brand',
    key: 'topbar_fallback_message',
    value: 'Premium oversized essentials crafted in India - limited drops, clean fits, everyday comfort.',
    label: 'Topbar Fallback Message',
    description: 'Shown when no website announcement or active coupon is available.',
    type: 'string',
    isPublic: true,
  },
  {
    group: 'brand',
    key: 'header_supported_links',
    value: JSON.stringify([
      { label: 'SUPPORTED BY', url: '', logo: '', badgeText: 'Flipkart' },
      { label: 'SUPPORTED BY', url: '', logo: '', badgeText: 'Amazon' },
    ], null, 2),
    label: 'Header Supported Links',
    description: 'Marketplace links shown in header. Multiple entries rotate automatically.',
    type: 'json',
    isPublic: true,
  },
  { group: 'theme', key: 'primary_color', value: '#0F172A', label: 'Primary Color', type: 'color', isPublic: true },
  { group: 'theme', key: 'accent_color', value: '#C9A84C', label: 'Accent Color', type: 'color', isPublic: true },
  { group: 'theme', key: 'secondary_color', value: '#1E293B', label: 'Secondary Color', type: 'color', isPublic: true },
  { group: 'tax', key: 'gst_number', value: '', label: 'GST Number', type: 'string', isPublic: false },
  { group: 'tax', key: 'pan_number', value: '', label: 'PAN Number', type: 'string', isPublic: false },
  { group: 'tax', key: 'default_gst_rate', value: 12, label: 'Default GST Rate (%)', type: 'number', isPublic: true },
  { group: 'invoice', key: 'invoice_prefix', value: 'VEL-INV', label: 'Invoice Prefix', type: 'string', isPublic: false },
  { group: 'invoice', key: 'estimate_prefix', value: 'VEL-EST', label: 'Estimate Prefix', type: 'string', isPublic: false },
  { group: 'invoice', key: 'proforma_prefix', value: 'VEL-PI', label: 'Proforma Invoice Prefix', type: 'string', isPublic: false },
  { group: 'invoice', key: 'receipt_prefix', value: 'VEL-REC', label: 'Receipt Prefix', type: 'string', isPublic: false },
  { group: 'invoice', key: 'credit_note_prefix', value: 'VEL-CN', label: 'Credit Note Prefix', type: 'string', isPublic: false },
  { group: 'invoice', key: 'debit_note_prefix', value: 'VEL-DN', label: 'Debit Note Prefix', type: 'string', isPublic: false },
  { group: 'invoice', key: 'purchase_prefix', value: 'VEL-PO', label: 'Purchase Order Prefix', type: 'string', isPublic: false },
  { group: 'invoice', key: 'order_prefix', value: 'VEL', label: 'Order Number Prefix', type: 'string', isPublic: false },
  { group: 'bank', key: 'bank_name', value: '', label: 'Bank Name', type: 'string', isPublic: true },
  { group: 'bank', key: 'bank_account', value: '', label: 'Account Number', type: 'string', isPublic: true },
  { group: 'bank', key: 'bank_ifsc', value: '', label: 'IFSC Code', type: 'string', isPublic: true },
  { group: 'bank', key: 'upi_id', value: '', label: 'UPI ID', type: 'string', isPublic: true },
  { group: 'bank', key: 'upi_qr_image', value: '', label: 'UPI QR Code Image', type: 'image', isPublic: true },
  { group: 'general', key: 'currency', value: 'INR', label: 'Currency', type: 'string', isPublic: true },
  { group: 'general', key: 'currency_symbol', value: 'Rs.', label: 'Currency Symbol', type: 'string', isPublic: true },
  { group: 'shipping', key: 'free_shipping_threshold', value: 999, label: 'Free Shipping Above', type: 'number', isPublic: true },
  { group: 'shipping', key: 'shipping_charge', value: 79, label: 'Default Shipping Charge', type: 'number', isPublic: true },
  { group: 'shipping', key: 'cod_charge', value: 49, label: 'COD Extra Charge', type: 'number', isPublic: true },
  { group: 'seo', key: 'default_meta_title', value: 'VELRUMA - Premium Clothing Brand', label: 'Default Meta Title', type: 'string', isPublic: true },
  {
    group: 'seo',
    key: 'default_meta_description',
    value: 'Discover premium clothing at VELRUMA. Elevate your style with our curated collections of modern, luxury fashion.',
    label: 'Default Meta Description',
    type: 'string',
    isPublic: true,
  },
  { group: 'seo', key: 'default_og_image', value: '', label: 'Default OG Image', type: 'image', isPublic: true },
  { group: 'email', key: 'smtp_host', value: '', label: 'SMTP Host', description: 'Example: smtp.gmail.com, smtp.hostinger.com', type: 'string', isPublic: false },
  { group: 'email', key: 'smtp_port', value: 587, label: 'SMTP Port', description: 'Use 587 for STARTTLS or 465 for SSL.', type: 'number', isPublic: false },
  { group: 'email', key: 'smtp_secure', value: false, label: 'SMTP Secure SSL', description: 'Enable for port 465.', type: 'boolean', isPublic: false },
  { group: 'email', key: 'smtp_user', value: '', label: 'SMTP Username', type: 'string', isPublic: false },
  { group: 'email', key: 'smtp_password', value: '', label: 'SMTP Password / App Password', type: 'string', isPublic: false },
  { group: 'email', key: 'smtp_from_email', value: 'hello@velruma.com', label: 'From Email', type: 'string', isPublic: false },
  { group: 'email', key: 'smtp_from_name', value: 'VELRUMA', label: 'From Name', type: 'string', isPublic: false },
  { group: 'email', key: 'marketing_reply_to', value: 'hello@velruma.com', label: 'Marketing Reply-To Email', type: 'string', isPublic: false },
  { group: 'email', key: 'marketing_footer_text', value: 'VELRUMA - Premium oversized essentials crafted in India.', label: 'Marketing Email Footer Text', type: 'textarea', isPublic: false },
  { group: 'email', key: 'marketing_default_logo', value: '', label: 'Marketing Email Logo', type: 'image', isPublic: false },
  {
    group: 'homepage',
    key: 'home_hero_slides',
    value: JSON.stringify([
      {
        title: 'Premium Streetwear, Softer Than Ever',
        subtitle: 'Discover VELRUMA essentials made for daily comfort and sharp silhouettes.',
        image: '',
        ctaLabel: 'Shop New Arrivals',
        ctaHref: '/shop',
        badge: 'New Drop',
        aspectRatio: '16 / 5',
        objectPosition: 'center',
        imageFit: 'cover',
      },
      {
        title: 'Oversized Fits Built For Every Day',
        subtitle: 'Clean details, versatile colors and premium fabrics for your wardrobe.',
        image: '',
        ctaLabel: 'Explore Collections',
        ctaHref: '/collections',
        badge: 'VELRUMA 2026',
        aspectRatio: '16 / 5',
        objectPosition: 'center',
        imageFit: 'cover',
      },
    ], null, 2),
    label: 'Homepage Hero Slides',
    type: 'textarea',
    isPublic: true,
  },
];

async function ensureDefaultSettings() {
  const defaultKeys = defaultSettings.map((setting) => setting.key);
  const existingKeys = await Setting.distinct('key', { key: { $in: defaultKeys } });
  const missingSettings = defaultSettings.filter((setting) => !existingKeys.includes(setting.key));

  if (missingSettings.length === 0) return;

  try {
    await Setting.insertMany(missingSettings, { ordered: false });
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 11000) return;
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await ensureDefaultSettings();

    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    const publicOnly = searchParams.get('public') === 'true';
    const query: Record<string, unknown> = {};

    if (group) query.group = group;
    if (publicOnly) {
      query.$or = [
        { isPublic: true },
        { key: { $in: ['default_gst_rate', 'upi_id', 'upi_qr_image'] } },
      ];
    }

    const settings = await Setting.find(query).sort({ group: 1, key: 1 });
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'settings', 'edit');
    if (!admin.ok) return admin.response;

    const body = await request.json() as { settings?: SettingPayload[] } & SettingPayload;
    const entries: SettingPayload[] = Array.isArray(body.settings) ? body.settings : [body];
    const settingsToSave = entries.filter((item: SettingPayload) => Boolean(item.key));

    if (settingsToSave.length === 0) {
      await ensureDefaultSettings();
      const settings = await Setting.find({}).sort({ group: 1, key: 1 });
      return NextResponse.json({ success: true, data: settings });
    }

    for (const item of settingsToSave) {
      await Setting.findOneAndUpdate(
        { key: item.key },
        {
          $set: {
            group: item.group,
            key: item.key,
            value: item.value,
            label: item.label || item.key,
            description: item.description,
            type: item.type || 'string',
            options: item.options || [],
            isPublic: item.isPublic ?? false,
          },
        },
        { returnDocument: 'after', upsert: true, runValidators: true }
      );
    }

    const settings = await Setting.find({}).sort({ group: 1, key: 1 });
    await auditAdminAction({
      request,
      context: admin.context,
      module: 'settings',
      action: 'update',
      description: `updated ${settingsToSave.length} setting${settingsToSave.length === 1 ? '' : 's'}`,
      metadata: { keys: settingsToSave.map((setting) => setting.key) },
    });
    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    console.error('Settings PUT error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
