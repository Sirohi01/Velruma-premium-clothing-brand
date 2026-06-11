import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const collection = await Collection.findById(id).populate('products');
    
    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: collection });
  } catch (error) {
    console.error('Collection GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'collections', 'edit');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    const body = await request.json();
    
    const collection = await Collection.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }
    await auditAdminAction({ request, context: admin.context, module: 'collections', action: 'update', entity: collection });
    
    return NextResponse.json({ success: true, data: collection });
  } catch (error: any) {
    console.error('Collection PUT error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'collections', 'delete');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    
    const collection = await Collection.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
    
    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }
    await auditAdminAction({ request, context: admin.context, module: 'collections', action: 'delete', entity: collection, description: 'deactivated collection' });
    
    return NextResponse.json({ success: true, message: 'Collection deactivated successfully', data: collection });
  } catch (error) {
    console.error('Collection DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
