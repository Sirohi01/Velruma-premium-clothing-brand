import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category';
import '@/models/Collection';
import '@/models/Phase9';
import { generateSKU } from '@/lib/utils';

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
        extraPrice: Number(variant.extraPrice || 0),
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    // Check if ID is a slug or an ObjectId
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    
    const product = await Product.findOne(query)
      .populate('category', 'name slug')
      .populate('collections', 'name slug');
    
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const payload = normalizeProductPayload(body);
    
    // Auto-generate SKUs for new variants
    if (payload.variants && Array.isArray(payload.variants)) {
      payload.variants = payload.variants.map((variant: any) => {
        if (!variant.sku) {
          variant.sku = generateSKU(payload.category?.toString() || 'GEN', payload.title || 'PRD', variant.size, variant.color);
        }
        return variant;
      });
    }

    const product = await Product.findByIdAndUpdate(id, payload, { returnDocument: 'after', runValidators: true });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('Product PUT error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug or SKU already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    // Soft delete or status change is preferred
    const product = await Product.findByIdAndUpdate(id, { status: 'archived' }, { returnDocument: 'after' });
    
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Product archived successfully' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
