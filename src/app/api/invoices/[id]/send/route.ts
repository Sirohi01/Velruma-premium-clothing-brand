import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { notifyInvoice } from '@/lib/order-email';

function findQuery(id: string) {
  return id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { invoiceNumber: id };
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const invoice = await Invoice.findOne(findQuery(id)).populate('order');
    if (!invoice) return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    if (!invoice.customerEmail) return NextResponse.json({ success: false, error: 'Customer email is missing' }, { status: 400 });

    await notifyInvoice(invoice);

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Invoice email failed' }, { status: 500 });
  }
}
