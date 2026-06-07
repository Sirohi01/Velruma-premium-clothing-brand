import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Role from '@/models/Role';
import User from '@/models/User';
import Setting from '@/models/Setting';
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

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        roles: Object.keys(createdRoles).length,
        settings: defaultSettings.length,
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
