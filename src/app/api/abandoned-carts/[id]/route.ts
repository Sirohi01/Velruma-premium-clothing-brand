import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AbandonedCart from '@/models/AbandonedCart';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const cart = await AbandonedCart.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!cart) return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: cart });
  } catch (error: any) {
    console.error('Abandoned cart PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const cart = await AbandonedCart.findByIdAndUpdate(id, { status: 'lost' }, { returnDocument: 'after', runValidators: true });
    if (!cart) return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: cart, message: 'Cart marked lost' });
  } catch (error) {
    console.error('Abandoned cart DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
