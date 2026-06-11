import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const query: any = {};
    if (activeOnly) query.isActive = true;

    const collections = await Collection.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error('Collections GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'collections', 'create');
    if (!admin.ok) return admin.response;
    const body = await request.json();
    
    const collection = await Collection.create(body);
    await auditAdminAction({ request, context: admin.context, module: 'collections', action: 'create', entity: collection });
    return NextResponse.json({ success: true, data: collection }, { status: 201 });
  } catch (error: any) {
    console.error('Collections POST error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
