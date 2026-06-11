import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const category = await Category.findById(id).populate('parentCategory', 'name slug');
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Category GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'categories', 'edit');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    const body = await request.json();
    
    const category = await Category.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    await auditAdminAction({ request, context: admin.context, module: 'categories', action: 'update', entity: category });
    
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error('Category PUT error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'categories', 'delete');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    const category = await Category.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    await auditAdminAction({ request, context: admin.context, module: 'categories', action: 'delete', entity: category, description: 'deactivated category' });
    
    return NextResponse.json({ success: true, message: 'Category deactivated successfully', data: category });
  } catch (error) {
    console.error('Category DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
