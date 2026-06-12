import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import Setting from '@/models/Setting';
import BusinessDocument from '@/models/BusinessDocument';
import { verifyToken } from '@/lib/auth';
import { notifyOrderConfirmed, notifyPaymentReceipt, notifyPaymentVerification } from '@/lib/order-email';

function sequence(prefix: string) {
  const stamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

async function getNumberSetting(key: string, fallback: number) {
  const setting = await Setting.findOne({ key }).select('value').lean();
  const value = Number(setting?.value ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const query: Record<string, unknown> = {};
    if (email) query.email = email.toLowerCase();
    if (status) query.orderStatus = status;
    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const token = request.cookies.get('velruma-token')?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!body.items?.length) {
      return NextResponse.json({ success: false, error: 'Cart items are required' }, { status: 400 });
    }

    const subtotal = Number(body.subtotal || body.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0));
    const discount = Number(body.discount || 0);
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const isAdminOrder = Boolean(body.orderSource);
    const freeShippingThreshold = await getNumberSetting('free_shipping_threshold', 999);
    const defaultShippingCharge = await getNumberSetting('shipping_charge', 79);
    const codCharge = await getNumberSetting('cod_charge', 49);
    const gstRate = await getNumberSetting('default_gst_rate', 12);
    const shippingFee = isAdminOrder ? Number(body.shippingFee || 0) : subtotal >= freeShippingThreshold ? 0 : defaultShippingCharge;
    const codFee = isAdminOrder ? Number(body.codFee || 0) : body.paymentMethod === 'COD' ? codCharge : 0;
    const tax = isAdminOrder ? Number(body.tax || 0) : Math.round((taxableSubtotal * gstRate) / 100);
    const total = taxableSubtotal + tax + shippingFee + codFee;
    const orderId = sequence('VEL-ORD');
    const isManualPayment = body.paymentMethod === 'UPI';
    const isPrepaid = body.paymentMethod === 'PREPAID';
    const initialOrderStatus = isManualPayment ? 'Pending' : 'Confirmed';
    const initialPaymentStatus = isPrepaid ? 'Paid' : 'Pending';
    const orderPayload = {
      orderId,
      user: payload?.userId,
      customerName: body.customerName,
      email: String(body.email).toLowerCase(),
      phone: body.phone,
      shippingAddress: body.shippingAddress,
      items: body.items.map((item: any) => ({
        productId: item.productId,
        title: item.name || item.title,
        slug: item.slug,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        variant: { size: item.size, color: item.color, sku: item.sku },
      })),
      subtotal,
      shippingFee,
      tax,
      discount,
      codFee,
      total,
      paymentMethod: body.paymentMethod,
      paymentStatus: initialPaymentStatus,
      upiProofImage: body.upiProofImage,
      orderSource: body.orderSource || 'Website',
      sourceReference: body.sourceReference,
      orderStatus: initialOrderStatus,
      timeline: [{
        status: initialOrderStatus,
        note: isManualPayment
          ? 'Manual payment proof received. Waiting for payment verification.'
          : 'Order confirmed successfully',
      }],
    };
    await new Order(orderPayload).validate();

    const stockReservations = new Map<string, { productId: string; variantId: string; quantity: number; name: string }>();

    for (const item of body.items) {
      const product = await Product.findById(item.productId);
      const variant = product?.variants.find((v: any) => v.sku === item.sku || v._id?.toString() === item.variantId);
      if (!product || !variant) {
        return NextResponse.json({ success: false, error: `Product unavailable: ${item.name}` }, { status: 400 });
      }
      const key = `${product._id.toString()}:${variant._id?.toString()}`;
      const existing = stockReservations.get(key);
      const requestedQuantity = Number(item.quantity || 0) + (existing?.quantity || 0);
      if (variant.stock < requestedQuantity) {
        return NextResponse.json({ success: false, error: `Insufficient stock for ${item.name}` }, { status: 400 });
      }
      stockReservations.set(key, {
        productId: product._id.toString(),
        variantId: variant._id?.toString() || '',
        quantity: requestedQuantity,
        name: item.name || item.title,
      });
    }

    const order = await Order.create(orderPayload);

    for (const reservation of stockReservations.values()) {
      const result = await Product.updateOne(
        { _id: reservation.productId, 'variants._id': reservation.variantId, 'variants.stock': { $gte: reservation.quantity } },
        { $inc: { 'variants.$.stock': -reservation.quantity } }
      );
      if (result.modifiedCount === 0) {
        order.orderStatus = 'Cancelled';
        order.adminNotes = `Auto-cancelled: stock changed before reservation for ${reservation.name}`;
        order.timeline.push({ status: 'Cancelled', note: `Stock unavailable for ${reservation.name}` });
        await order.save();
        return NextResponse.json({ success: false, error: `Insufficient stock for ${reservation.name}` }, { status: 409 });
      }
    }

    const invoice = await Invoice.create({
      invoiceNumber: sequence('VEL-INV'),
      order: order._id,
      customerName: order.customerName,
      customerEmail: order.email,
      subtotal,
      tax,
      shippingFee,
      discount,
      total,
      status: isPrepaid ? 'Paid' : 'Issued',
    });

    const documentBase = {
      customerName: order.customerName,
      customerEmail: order.email,
      reference: order.orderId,
      subtotal,
      tax,
      discount,
      total,
      status: 'Issued' as const,
      notes: `Auto-generated for ${order.orderId}`,
    };

    const estimate = await BusinessDocument.create({
      ...documentBase,
      documentType: 'estimate',
      documentNumber: sequence('VEL-EST'),
    });

    const proforma = await BusinessDocument.create({
      ...documentBase,
      documentType: 'proforma',
      documentNumber: sequence('VEL-PRO'),
    });

    const payment = await Payment.create({
      paymentNumber: sequence('VEL-PAY'),
      order: order._id,
      invoice: invoice._id,
      method: body.paymentMethod,
      status: initialPaymentStatus,
      amount: total,
      proofImage: body.upiProofImage,
      paidAt: isPrepaid ? new Date() : undefined,
    });

    const receipt = isPrepaid ? await BusinessDocument.create({
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
    }) : null;

    if (isManualPayment) {
      await notifyPaymentVerification(order);
    } else {
      await notifyOrderConfirmed(order);
    }
    if (receipt) await notifyPaymentReceipt(receipt);

    return NextResponse.json({ success: true, data: { order, invoice, payment, estimate, proforma, receipt } }, { status: 201 });
  } catch (error: any) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
