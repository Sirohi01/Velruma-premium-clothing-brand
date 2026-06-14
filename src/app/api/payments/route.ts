import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import { requireAdminAction } from '@/lib/admin-api';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'payments', 'view');
    if (!admin.ok) return admin.response;
    const payments = await Payment.find({}).populate('order', 'orderId customerName').populate('invoice', 'invoiceNumber').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Payments GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
