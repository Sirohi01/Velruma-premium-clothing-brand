import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PurchaseOrder from '@/models/PurchaseOrder';
import '@/models/Supplier';
import '@/models/Product';

function poNumber() {
  return `VEL-PO-${Date.now().toString().slice(-8)}`;
}

function totals(items: any[], tax = 0, shipping = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0), 0);
  return { subtotal, tax: Number(tax || 0), shipping: Number(shipping || 0), total: subtotal + Number(tax || 0) + Number(shipping || 0) };
}

export async function GET() {
  try {
    await dbConnect();
    const purchases = await PurchaseOrder.find({}).populate('supplier', 'name code').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: purchases });
  } catch (error) {
    console.error('Purchases GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const amount = totals(body.items || [], body.tax, body.shipping);
    const purchase = await PurchaseOrder.create({
      ...body,
      poNumber: body.poNumber || poNumber(),
      ...amount,
    });
    return NextResponse.json({ success: true, data: purchase }, { status: 201 });
  } catch (error: any) {
    console.error('Purchases POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
