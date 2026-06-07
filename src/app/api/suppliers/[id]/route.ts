import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Supplier from '@/models/Supplier';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const supplier = await Supplier.findById(id);
    if (!supplier) return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Supplier GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const supplier = await Supplier.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!supplier) return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: supplier });
  } catch (error: any) {
    console.error('Supplier PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const supplier = await Supplier.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
    if (!supplier) return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Supplier deactivated' });
  } catch (error) {
    console.error('Supplier DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
