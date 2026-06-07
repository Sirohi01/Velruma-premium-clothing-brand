import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AbandonedCart from '@/models/AbandonedCart';
import '@/models/User';
import '@/models/Product';

function total(items: any[]) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
}

export async function GET() {
  try {
    await dbConnect();
    const carts = await AbandonedCart.find({})
      .populate('customer', 'name email phone')
      .populate('items.product', 'title slug')
      .sort({ lastActivityAt: -1 });
    return NextResponse.json({ success: true, data: carts });
  } catch (error) {
    console.error('Abandoned carts GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const cart = await AbandonedCart.create({
      ...body,
      total: body.total ?? total(body.items || []),
      lastActivityAt: body.lastActivityAt || new Date(),
    });
    return NextResponse.json({ success: true, data: cart }, { status: 201 });
  } catch (error: any) {
    console.error('Abandoned carts POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
