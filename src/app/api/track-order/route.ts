import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function maskEmail(email = '') {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${name.length > 2 ? '***' : '*'}@${domain}`;
}

function maskPhone(phone = '') {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return phone;
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function safeNumber(value: unknown) {
  return Number(value || 0);
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const orderId = (searchParams.get('order') || searchParams.get('orderId') || '').trim();
    const email = (searchParams.get('email') || '').trim().toLowerCase();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Please enter your order ID.' }, { status: 400 });
    }

    const order = await Order.findOne({
      orderId: { $regex: `^${escapeRegex(orderId)}$`, $options: 'i' },
    }).lean();

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found. Please check the order ID and try again.' }, { status: 404 });
    }

    if (email && String(order.email || '').toLowerCase() !== email) {
      return NextResponse.json({ success: false, error: 'Order not found for this email.' }, { status: 404 });
    }

    const shippingAddress = order.shippingAddress || {};
    const timeline = Array.isArray(order.timeline) && order.timeline.length > 0
      ? order.timeline
      : [{ status: order.orderStatus || 'Pending', note: 'Order created', createdAt: order.createdAt }];

    return NextResponse.json({
      success: true,
      data: {
        order: {
          orderId: order.orderId,
          customerName: order.customerName,
          email: maskEmail(order.email),
          phone: maskPhone(order.phone),
          shippingAddress: {
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            pincode: shippingAddress.pincode || '',
            country: shippingAddress.country || 'India',
          },
          items: (order.items || []).map((item: any) => ({
            title: item.title,
            slug: item.slug,
            image: item.image,
            price: safeNumber(item.price),
            quantity: safeNumber(item.quantity),
            variant: {
              size: item.variant?.size || '',
              color: item.variant?.color || '',
              sku: item.variant?.sku || '',
            },
          })),
          subtotal: safeNumber(order.subtotal),
          shippingFee: safeNumber(order.shippingFee),
          codFee: safeNumber(order.codFee),
          tax: safeNumber(order.tax),
          discount: safeNumber(order.discount),
          total: safeNumber(order.total),
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          trackingNumber: order.trackingNumber || '',
          courierName: order.courierName || '',
          timeline: timeline.map((entry: any) => ({
            status: entry.status,
            note: entry.note || '',
            createdAt: entry.createdAt || entry.updatedAt || order.createdAt,
          })),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Track order GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
