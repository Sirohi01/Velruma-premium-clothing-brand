import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Order from '@/models/Order';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { invoiceNumber: id };
    let invoice = await Invoice.findOne(query).populate('order');
    if (!invoice) {
      const orderQuery = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };
      const order = await Order.findOne(orderQuery).select('_id').lean();
      if (order) invoice = await Invoice.findOne({ order: order._id }).populate('order');
    }
    if (!invoice) return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Invoice GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
