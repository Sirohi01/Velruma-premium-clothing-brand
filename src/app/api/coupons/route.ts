import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const query: Record<string, unknown> = {};
    if (active === 'true') query.isActive = true;
    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Coupons GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const coupon = await Coupon.create({ ...body, code: body.code?.toUpperCase() });
    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error: any) {
    console.error('Coupons POST error:', error);
    if (error.code === 11000) return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 400 });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
