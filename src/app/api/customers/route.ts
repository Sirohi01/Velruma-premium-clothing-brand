import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';
import Order from '@/models/Order';
import { hashPassword } from '@/lib/auth';
import { syncCustomersFromOrders } from '@/lib/customer-sync';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await syncCustomersFromOrders();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const customerRole = await Role.findOne({ slug: 'customer' }).select('_id').lean();
    const query: any = customerRole ? { role: customerRole._id } : {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires')
      .populate('role', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
    const emails = customers.map((customer: any) => customer.email).filter(Boolean);
    const orders = await Order.find({ email: { $in: emails } })
      .select('email total subtotal discount orderStatus paymentStatus createdAt')
      .lean();
    const stats = new Map<string, { orders: number; revenue: number; lastOrderAt?: Date; delivered: number; returned: number }>();
    for (const order of orders as any[]) {
      const key = String(order.email || '').toLowerCase();
      const item = stats.get(key) || { orders: 0, revenue: 0, delivered: 0, returned: 0 };
      item.orders += 1;
      if (!['Cancelled', 'Returned'].includes(order.orderStatus)) {
        item.revenue += Math.max(0, Number(order.subtotal || order.total || 0) - Number(order.discount || 0));
      }
      if (order.orderStatus === 'Delivered') item.delivered += 1;
      if (order.orderStatus === 'Returned') item.returned += 1;
      if (!item.lastOrderAt || new Date(order.createdAt) > new Date(item.lastOrderAt)) item.lastOrderAt = order.createdAt;
      stats.set(key, item);
    }

    return NextResponse.json({
      success: true,
      data: customers.map((customer: any) => ({
        ...customer,
        orderStats: stats.get(String(customer.email || '').toLowerCase()) || { orders: 0, revenue: 0, delivered: 0, returned: 0 },
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const role = await Role.findOne({ slug: 'customer' });
    if (!role) return NextResponse.json({ success: false, error: 'Customer role not found. Run seed first.' }, { status: 400 });
    const customer = await User.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: await hashPassword(body.password || 'Velruma@123'),
      role: role._id,
      isActive: body.isActive ?? true,
      loyaltyPoints: Number(body.loyaltyPoints || 0),
      addresses: body.addresses || [],
    });
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Customer save failed' }, { status: 500 });
  }
}
