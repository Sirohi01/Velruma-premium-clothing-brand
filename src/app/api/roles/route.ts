import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Role from '@/models/Role';

function normalizePermissions(permissions: Record<string, unknown> | undefined) {
  return permissions ? new Map(Object.entries(permissions)) : new Map();
}

export async function GET() {
  try {
    await dbConnect();
    const roles = await Role.find({}).sort({ isSystem: -1, name: 1 });
    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    console.error('Roles GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const role = await Role.create({
      name: body.name,
      slug: body.slug,
      description: body.description,
      permissions: normalizePermissions(body.permissions),
      isSystem: false,
      isActive: body.isActive ?? true,
    });
    return NextResponse.json({ success: true, data: role }, { status: 201 });
  } catch (error: any) {
    console.error('Roles POST error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Role name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
