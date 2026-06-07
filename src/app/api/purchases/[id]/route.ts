import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PurchaseOrder from '@/models/PurchaseOrder';
import '@/models/Supplier';
import '@/models/Product';

function totals(items: any[], tax = 0, shipping = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0), 0);
  return { subtotal, tax: Number(tax || 0), shipping: Number(shipping || 0), total: subtotal + Number(tax || 0) + Number(shipping || 0) };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const purchase = await PurchaseOrder.findById(id).populate('supplier', 'name code contacts').populate('items.product', 'title slug');
    if (!purchase) return NextResponse.json({ success: false, error: 'Purchase order not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    console.error('Purchase GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const amount = body.items ? totals(body.items, body.tax, body.shipping) : {};
    const purchase = await PurchaseOrder.findByIdAndUpdate(id, { ...body, ...amount }, { returnDocument: 'after', runValidators: true });
    if (!purchase) return NextResponse.json({ success: false, error: 'Purchase order not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: purchase });
  } catch (error: any) {
    console.error('Purchase PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const purchase = await PurchaseOrder.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { returnDocument: 'after', runValidators: true }
    );
    if (!purchase) return NextResponse.json({ success: false, error: 'Purchase order not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Purchase order cancelled', data: purchase });
  } catch (error) {
    console.error('Purchase DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
