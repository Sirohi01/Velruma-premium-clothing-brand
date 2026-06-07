import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CmsPage from '@/models/CmsPage';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
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
    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error: any) {
    console.error('CMS POST error:', error);
    if (error.code === 11000) return NextResponse.json({ success: false, error: 'Page slug already exists' }, { status: 400 });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
