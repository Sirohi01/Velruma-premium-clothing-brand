import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const post = await Blog.findOne({ $or: [{ _id: id.match(/^[a-f\d]{24}$/i) ? id : undefined }, { slug: id }] });
    if (!post) return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const update = {
      ...body,
      slug: body.slug || (body.title ? slugify(body.title) : undefined),
      publishedAt: body.status === 'published' ? body.publishedAt || new Date() : body.publishedAt,
    };
    const objectIdQuery = id.match(/^[a-f\d]{24}$/i) ? { _id: id } : null;
    const slug = update.slug;
    const query = objectIdQuery ? { $or: [objectIdQuery, ...(slug ? [{ slug }] : [])] } : { slug: id };
    const post = await Blog.findOneAndUpdate(query, update, { returnDocument: 'after', runValidators: true });
    if (!post) return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Blog PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const post = await Blog.findByIdAndUpdate(id, { status: 'archived' }, { returnDocument: 'after' });
    if (!post) return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: post, message: 'Blog post archived' });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
