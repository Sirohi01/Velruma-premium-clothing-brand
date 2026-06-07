import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function GET() {
  try {
    await dbConnect();
    const invoices = await Invoice.find({}).populate('order', 'orderId orderStatus paymentStatus').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
