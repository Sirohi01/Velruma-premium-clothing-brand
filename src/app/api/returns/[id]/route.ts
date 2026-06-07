import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ReturnModel from '@/models/Return';
import '@/models/Order';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await ReturnModel.findById(id).populate('order', 'orderId customerName total orderStatus').lean();
    if (!item) return NextResponse.json({ success: false, error: 'Return not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const item = await ReturnModel.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!item) return NextResponse.json({ success: false, error: 'Return not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Return update failed' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await ReturnModel.findByIdAndUpdate(id, { status: 'Rejected' }, { returnDocument: 'after' });
    if (!item) return NextResponse.json({ success: false, error: 'Return not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Return action failed' }, { status: 500 });
  }
}
