import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { requireAdminAction } from '@/lib/admin-api';
import { paginationFromRequest, paginationMeta } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'invoices', 'view');
    if (!admin.ok) return admin.response;
    const pagination = paginationFromRequest(request, { page: 1, limit: 8 });
    const query = Invoice.find({}).populate('order', 'orderId orderStatus paymentStatus').sort({ createdAt: -1 });
    if (pagination.enabled) {
      const [invoices, total] = await Promise.all([
        query.clone().skip(pagination.skip).limit(pagination.limit),
        Invoice.countDocuments({}),
      ]);
      return NextResponse.json({ success: true, data: invoices, pagination: paginationMeta(pagination.page, pagination.limit, total) });
    }
    const invoices = await query;
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
