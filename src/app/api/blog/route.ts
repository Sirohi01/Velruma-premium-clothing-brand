import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('public') === 'true';
    const query: Record<string, unknown> = {};
    if (publicOnly) query.status = 'published';
    const posts = await Blog.find(query).sort({ publishedAt: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const post = await Blog.create({
      ...body,
      slug: body.slug || slugify(body.title || 'blog-post'),
      publishedAt: body.status === 'published' ? body.publishedAt || new Date() : body.publishedAt,
    });
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) {
    console.error('Blog POST error:', error);
    if (error.code === 11000) return NextResponse.json({ success: false, error: 'Blog slug already exists' }, { status: 400 });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
