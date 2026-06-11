import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category';
import '@/models/Collection';
import '@/models/Phase9';
import { generateSKU } from '@/lib/utils';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';

function normalizeVariantExtraPrice(value: unknown, body: any) {
  const extraPrice = Number(value || 0);
  const basePrice = Number(body.basePrice || 0);
  const salePrice = Number(body.salePrice || body.basePrice || 0);

  // Admin variant price is only an add-on over the product price. If the product
  // selling/MRP price was accidentally repeated here, prevent double charging.
  if (extraPrice > 0 && (extraPrice === salePrice || extraPrice === basePrice)) {
    return 0;
  }

  return extraPrice;
}

function normalizeProductPayload(body: any) {
  const images = Array.isArray(body.images)
    ? body.images.filter((image: any) => image?.url).map((image: any, index: number) => ({
      url: image.url,
      alt: image.alt || body.title || '',
      isPrimary: index === 0 ? true : Boolean(image.isPrimary),
    }))
    : [];
  const videos = Array.isArray(body.videos)
    ? body.videos.filter((video: any) => video?.url).map((video: any, index: number) => ({
      url: video.url,
      title: video.title || '',
      isPrimary: index === 0 ? true : Boolean(video.isPrimary),
    }))
    : [];
  const variants = Array.isArray(body.variants)
    ? body.variants
      .filter((variant: any) => variant?.size || variant?.color || Number(variant?.stock || 0) > 0 || variant?.sku)
      .map((variant: any) => ({
        ...variant,
        size: String(variant.size || '').trim(),
        color: String(variant.color || '').trim(),
        stock: Number(variant.stock || 0),
        extraPrice: normalizeVariantExtraPrice(variant.extraPrice, body),
      }))
    : [];
  const productHighlights = Array.isArray(body.productHighlights)
    ? body.productHighlights
      .filter((highlight: any) => highlight?.title || highlight?.subtitle)
      .map((highlight: any) => ({
        icon: String(highlight.icon || 'shirt'),
        title: String(highlight.title || '').trim(),
        subtitle: String(highlight.subtitle || '').trim(),
      }))
    : [];

  return {
    ...body,
    basePrice: Number(body.basePrice || 0),
    salePrice: Number(body.salePrice || body.basePrice || 0),
    costPrice: Number(body.costPrice || 0),
    brand: body.brand || 'VELRUMA',
    brandSlug: body.brandSlug || String(body.brand || 'velruma').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    discountType: body.discountType || 'none',
    discountValue: Number(body.discountValue || 0),
    images,
    videos,
    variants,
    productHighlights,
  };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'variants.sku': { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('collections', 'name slug')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'products', 'create');
    if (!admin.ok) return admin.response;
    const body = await request.json();
    const payload = normalizeProductPayload(body);
    
    // Auto-generate SKUs for variants if not provided
    if (payload.variants && Array.isArray(payload.variants)) {
      payload.variants = payload.variants.map((variant: any) => {
        if (!variant.sku) {
          variant.sku = generateSKU(payload.category?.toString() || 'GEN', payload.title, variant.size, variant.color);
        }
        return variant;
      });
    }

    const product = await Product.create(payload);
    await auditAdminAction({ request, context: admin.context, module: 'products', action: 'create', entity: product });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.error('Products POST error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug or SKU already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
