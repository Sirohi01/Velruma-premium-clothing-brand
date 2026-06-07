import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Role from '@/models/Role';

function normalizePermissions(permissions: Record<string, unknown> | undefined) {
  return permissions ? new Map(Object.entries(permissions)) : undefined;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const role = await Role.findById(id);
    if (!role) return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: role });
  } catch (error) {
    console.error('Role GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const update = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      isActive: body.isActive,
      ...(body.permissions ? { permissions: normalizePermissions(body.permissions) } : {}),
    };
    const role = await Role.findByIdAndUpdate(id, update, { returnDocument: 'after', runValidators: true });
    if (!role) return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: role });
  } catch (error: any) {
    console.error('Role PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const role = await Role.findById(id);
    if (!role) return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
    if (role.isSystem) {
      return NextResponse.json({ success: false, error: 'System roles cannot be deleted' }, { status: 400 });
    }
    await role.deleteOne();
    return NextResponse.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Role DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
