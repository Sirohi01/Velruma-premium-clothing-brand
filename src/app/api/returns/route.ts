import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ReturnModel from '@/models/Return';
import '@/models/Order';

function returnNumber() {
  return `VEL-RET-${Date.now().toString().slice(-8)}`;
}

export async function GET() {
  try {
    await dbConnect();
    const returns = await ReturnModel.find({}).populate('order', 'orderId customerName total orderStatus').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: returns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const item = await ReturnModel.create({
      returnNumber: body.returnNumber || returnNumber(),
      order: body.order,
      reason: body.reason,
      status: body.status || 'Requested',
      notes: body.notes,
    });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Return save failed' }, { status: 500 });
  }
}
