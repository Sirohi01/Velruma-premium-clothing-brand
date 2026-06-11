import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CmsPage from '@/models/CmsPage';
import { syncCmsPageToSeo } from '@/lib/seo-sync';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const page = await CmsPage.findOne({ $or: [{ _id: id.match(/^[a-f\d]{24}$/i) ? id : undefined }, { slug: id }] });
    if (!page) return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error('CMS GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'cms', 'edit');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    const body = await request.json();
    const objectIdQuery = id.match(/^[a-f\d]{24}$/i) ? { _id: id } : null;
    const slug = body.slug || (body.title ? slugify(body.title) : undefined);
    const query = objectIdQuery ? { $or: [objectIdQuery, ...(slug ? [{ slug }] : [])] } : { slug: id };
    const page = await CmsPage.findOneAndUpdate(
      query,
      { ...body, slug: body.slug || (body.title ? slugify(body.title) : undefined) },
      { returnDocument: 'after', runValidators: true }
    );
    if (!page) return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    await syncCmsPageToSeo(page);
    await auditAdminAction({ request, context: admin.context, module: 'cms', action: 'update', entity: page });
    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error('CMS PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(_request, 'cms', 'delete');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    const page = await CmsPage.findByIdAndUpdate(id, { status: 'archived' }, { returnDocument: 'after' });
    if (!page) return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    await auditAdminAction({ request: _request, context: admin.context, module: 'cms', action: 'delete', entity: page, description: 'archived CMS page' });
    return NextResponse.json({ success: true, data: page, message: 'Page archived' });
  } catch (error) {
    console.error('CMS DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
