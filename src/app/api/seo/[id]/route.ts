import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SeoPage from '@/models/SeoPage';
import { normalizeSeoPayload, scoreSeo, syncSeoPageToCms } from '@/lib/seo-sync';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'seo', 'edit');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    const body = await request.json();
    const seoPayload = normalizeSeoPayload(body);
    const page = await SeoPage.findByIdAndUpdate(
      id,
      { ...seoPayload, score: body.score ?? scoreSeo(seoPayload, seoPayload.keywords) },
      { returnDocument: 'after', runValidators: true }
    );
    if (!page) return NextResponse.json({ success: false, error: 'SEO page not found' }, { status: 404 });
    await syncSeoPageToCms(page);
    await auditAdminAction({ request, context: admin.context, module: 'seo', action: 'update', entity: page });
    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error('SEO PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(_request, 'seo', 'delete');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    const page = await SeoPage.findByIdAndDelete(id);
    await auditAdminAction({ request: _request, context: admin.context, module: 'seo', action: 'delete', entity: page });
    return NextResponse.json({ success: true, message: 'SEO page removed' });
  } catch (error) {
    console.error('SEO DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
