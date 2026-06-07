import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';

function findQuery(id: string) {
  return id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const order = await Order.findOne(findQuery(id)).populate('user', 'name email');
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    const invoice = await Invoice.findOne({ order: order._id });
    const payments = await Payment.find({ order: order._id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: { order, invoice, payments } });
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const order = await Order.findOne(findQuery(id));
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

    if (body.orderStatus && body.orderStatus !== order.orderStatus) {
      order.timeline.push({ status: body.orderStatus, note: body.note || `Status changed to ${body.orderStatus}` });
      order.orderStatus = body.orderStatus;
    }
    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
    if (body.trackingNumber !== undefined) order.trackingNumber = body.trackingNumber;
    if (body.courierName !== undefined) order.courierName = body.courierName;
    if (body.adminNotes !== undefined) order.adminNotes = body.adminNotes;
    await order.save();

    if (body.paymentStatus) {
      await Payment.updateMany({ order: order._id }, { status: body.paymentStatus, paidAt: body.paymentStatus === 'Paid' ? new Date() : undefined });
      if (body.paymentStatus === 'Paid') await Invoice.updateMany({ order: order._id }, { status: 'Paid' });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Order PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
