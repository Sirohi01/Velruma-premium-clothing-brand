import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { requireAdminAction } from '@/lib/admin-api';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'invoices', 'view');
    if (!admin.ok) return admin.response;
    const invoices = await Invoice.find({}).populate('order', 'orderId orderStatus paymentStatus').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
