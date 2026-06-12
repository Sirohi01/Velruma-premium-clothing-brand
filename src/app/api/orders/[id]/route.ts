import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import BusinessDocument from '@/models/BusinessDocument';
import { notifyOrderConfirmed, notifyOrderStatusChanged, notifyPaymentReceipt } from '@/lib/order-email';

function findQuery(id: string) {
  return id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };
}

function sequence(prefix: string) {
  const stamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const order = await Order.findOne(findQuery(id)).populate('user', 'name email');
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    const invoice = await Invoice.findOne({ order: order._id });
    const businessDocuments = await BusinessDocument.find({ reference: order.orderId }).sort({ createdAt: -1 });
    const payments = await Payment.find({ order: order._id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: { order, invoice, payments, businessDocuments } });
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
    const previousOrderStatus = order.orderStatus;
    const previousPaymentStatus = order.paymentStatus;
    let statusEmail: string | null = null;
    let confirmationEmail = false;

    if (body.orderStatus && body.orderStatus !== order.orderStatus) {
      order.timeline.push({ status: body.orderStatus, note: body.note || `Status changed to ${body.orderStatus}` });
      order.orderStatus = body.orderStatus;
      statusEmail = body.orderStatus;
    }
    if (body.paymentStatus) {
      order.paymentStatus = body.paymentStatus;
      if (body.paymentStatus === 'Paid' && previousPaymentStatus !== 'Paid' && previousOrderStatus === 'Pending' && !body.orderStatus) {
        order.orderStatus = 'Confirmed';
        order.timeline.push({ status: 'Confirmed', note: 'Payment verified and order confirmed' });
        confirmationEmail = true;
      }
    }
    if (body.trackingNumber !== undefined) order.trackingNumber = body.trackingNumber;
    if (body.courierName !== undefined) order.courierName = body.courierName;
    if (body.adminNotes !== undefined) order.adminNotes = body.adminNotes;
    if (body.orderSource !== undefined) order.orderSource = body.orderSource;
    if (body.sourceReference !== undefined) order.sourceReference = body.sourceReference;
    await order.save();

    if (body.paymentStatus) {
      await Payment.updateMany({ order: order._id }, { status: body.paymentStatus, paidAt: body.paymentStatus === 'Paid' ? new Date() : undefined });
      if (body.paymentStatus === 'Paid') await Invoice.updateMany({ order: order._id }, { status: 'Paid' });
    }

    if (body.paymentStatus === 'Paid' && previousPaymentStatus !== 'Paid') {
      const existingReceipt = await BusinessDocument.findOne({ documentType: 'receipt', reference: order.orderId });
      const receipt = existingReceipt || await BusinessDocument.create({
        documentType: 'receipt',
        documentNumber: sequence('VEL-RCT'),
        customerName: order.customerName,
        customerEmail: order.email,
        reference: order.orderId,
        subtotal: order.total,
        tax: 0,
        discount: 0,
        total: order.total,
        status: 'Paid',
        notes: `Payment received for ${order.orderId}`,
      });
      await notifyPaymentReceipt(receipt);
    }

    if (confirmationEmail || statusEmail === 'Confirmed') {
      await notifyOrderConfirmed(order);
    } else if (statusEmail) {
      await notifyOrderStatusChanged(order, statusEmail);
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Order PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
