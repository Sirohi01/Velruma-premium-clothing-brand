import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import '@/models/Role';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'customers', 'view');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    const customer = await User.findById(id).select('-password -passwordResetToken -passwordResetExpires').populate('role', 'name slug').lean();
    if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    const orders = await Order.find({ email: customer.email })
      .sort({ createdAt: -1 })
      .select('orderId customerName email total subtotal discount orderStatus paymentStatus paymentMethod createdAt')
      .lean();
    const stats = orders.reduce((acc: any, order: any) => {
      acc.orders += 1;
      if (!['Cancelled', 'Returned'].includes(order.orderStatus)) {
        acc.revenue += Math.max(0, Number(order.subtotal || order.total || 0) - Number(order.discount || 0));
      }
      if (order.orderStatus === 'Delivered') acc.delivered += 1;
      if (order.orderStatus === 'Returned') acc.returned += 1;
      return acc;
    }, { orders: 0, revenue: 0, delivered: 0, returned: 0 });
    return NextResponse.json({ success: true, data: { customer, orders, stats } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'customers', 'edit');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    const body = await request.json();
    delete body.password;
    const customer = await User.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true }).select('-password');
    if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    await auditAdminAction({ request, context: admin.context, module: 'customers', action: 'update', entity: customer });
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Customer update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'customers', 'delete');
    if (!admin.ok) return admin.response;
    const { id } = await params;
    const customer = await User.findByIdAndUpdate(id, { isActive: false, deletedAt: new Date() }, { returnDocument: 'after' });
    if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    await auditAdminAction({ request, context: admin.context, module: 'customers', action: 'delete', entity: customer, description: 'deactivated customer' });
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Customer deactivate failed' }, { status: 500 });
  }
}
