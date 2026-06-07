import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProductionBatch from '@/models/ProductionBatch';
import '@/models/Product';
import '@/models/Supplier';
import '@/models/PurchaseOrder';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const batch = await ProductionBatch.findById(id)
      .populate('product', 'title slug')
      .populate('supplier', 'name code')
      .populate('purchaseOrder', 'poNumber status');
    if (!batch) return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: batch });
  } catch (error) {
    console.error('Production GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const batch = await ProductionBatch.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!batch) return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: batch });
  } catch (error: any) {
    console.error('Production PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const batch = await ProductionBatch.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { returnDocument: 'after', runValidators: true }
    );
    if (!batch) return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Batch cancelled', data: batch });
  } catch (error) {
    console.error('Production DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
