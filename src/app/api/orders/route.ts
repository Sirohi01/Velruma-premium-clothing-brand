import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import Setting from '@/models/Setting';
import { verifyToken } from '@/lib/auth';

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
    const freeShippingThreshold = await getNumberSetting('free_shipping_threshold', 999);
    const defaultShippingCharge = await getNumberSetting('shipping_charge', 79);
    const codCharge = await getNumberSetting('cod_charge', 49);
    const gstRate = await getNumberSetting('default_gst_rate', 12);
    const shippingFee = subtotal >= freeShippingThreshold ? 0 : defaultShippingCharge;
    const codFee = body.paymentMethod === 'COD' ? codCharge : 0;
    const tax = Math.round((subtotal * gstRate) / 100);
    const discount = Number(body.discount || 0);
    const total = subtotal + shippingFee + codFee + tax - discount;
    const orderId = sequence('VEL-ORD');

    for (const item of body.items) {
      const product = await Product.findById(item.productId);
      const variant = product?.variants.find((v: any) => v.sku === item.sku || v._id?.toString() === item.variantId);
      if (!product || !variant) {
        return NextResponse.json({ success: false, error: `Product unavailable: ${item.name}` }, { status: 400 });
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json({ success: false, error: `Insufficient stock for ${item.name}` }, { status: 400 });
      }
      variant.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
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
      paymentStatus: body.paymentMethod === 'COD' ? 'Pending' : 'Pending',
      upiProofImage: body.upiProofImage,
      orderStatus: 'Pending',
      timeline: [{ status: 'Pending', note: 'Order placed successfully' }],
    });

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
      status: 'Issued',
    });

    const payment = await Payment.create({
      paymentNumber: sequence('VEL-PAY'),
      order: order._id,
      invoice: invoice._id,
      method: body.paymentMethod,
      status: 'Pending',
      amount: total,
      proofImage: body.upiProofImage,
    });

    return NextResponse.json({ success: true, data: { order, invoice, payment } }, { status: 201 });
  } catch (error: any) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
