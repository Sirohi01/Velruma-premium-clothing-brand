import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    await dbConnect();
    const payments = await Payment.find({}).populate('order', 'orderId customerName').populate('invoice', 'invoiceNumber').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Payments GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
