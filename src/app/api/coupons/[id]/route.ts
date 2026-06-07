import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const coupon = await Coupon.findByIdAndUpdate(id, { ...body, code: body.code?.toUpperCase() }, { returnDocument: 'after', runValidators: true });
    if (!coupon) return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: coupon });
  } catch (error: any) {
    console.error('Coupon PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const coupon = await Coupon.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
    if (!coupon) return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: coupon, message: 'Coupon deactivated' });
  } catch (error) {
    console.error('Coupon DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
