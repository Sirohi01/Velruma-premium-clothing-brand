import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Invoice from '@/models/Invoice';
import Supplier from '@/models/Supplier';
import Lead from '@/models/Lead';
import SupportTicket from '@/models/SupportTicket';
import User from '@/models/User';
import { requireAdminAction } from '@/lib/admin-api';

function regex(value: string) {
  return { $regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const admin = await requireAdminAction(request, 'search', 'view');
    if (!admin.ok) return admin.response;
    const q = new URL(request.url).searchParams.get('q')?.trim() || '';
    if (q.length < 2) return NextResponse.json({ success: true, data: [] });

    const [products, orders, invoices, suppliers, leads, tickets, users] = await Promise.all([
      Product.find({ $or: [{ title: regex(q) }, { slug: regex(q) }, { brand: regex(q) }] }).select('title slug status basePrice').limit(8).lean(),
      Order.find({ $or: [{ orderId: regex(q) }, { customerName: regex(q) }, { email: regex(q) }, { phone: regex(q) }] }).select('orderId customerName total orderStatus').limit(8).lean(),
      Invoice.find({ $or: [{ invoiceNumber: regex(q) }, { customerName: regex(q) }] }).select('invoiceNumber customerName total status').limit(8).lean(),
      Supplier.find({ $or: [{ name: regex(q) }, { code: regex(q) }, { gstNumber: regex(q) }] }).select('name code type').limit(8).lean(),
      Lead.find({ $or: [{ name: regex(q) }, { email: regex(q) }, { phone: regex(q) }] }).select('name email status').limit(8).lean(),
      SupportTicket.find({ $or: [{ subject: regex(q) }, { ticketId: regex(q) }, { customerName: regex(q) }] }).select('ticketId subject status').limit(8).lean(),
      User.find({ $or: [{ name: regex(q) }, { email: regex(q) }, { phone: regex(q) }] }).select('name email phone').limit(8).lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: [
        { group: 'Products', items: products.map((item: any) => ({ title: item.title, subtitle: item.status, href: `/admin/products/${item._id}` })) },
        { group: 'Orders', items: orders.map((item: any) => ({ title: item.orderId, subtitle: `${item.customerName} - Rs.${item.total}`, href: `/admin/orders/${item._id}` })) },
        { group: 'Invoices', items: invoices.map((item: any) => ({ title: item.invoiceNumber, subtitle: item.customerName || item.status, href: `/admin/invoices/${item._id}` })) },
        { group: 'Suppliers', items: suppliers.map((item: any) => ({ title: item.name, subtitle: item.code || item.type, href: '/admin/suppliers' })) },
        { group: 'Leads', items: leads.map((item: any) => ({ title: item.name, subtitle: item.email || item.status, href: '/admin/crm' })) },
        { group: 'Tickets', items: tickets.map((item: any) => ({ title: item.ticketId || item.subject, subtitle: item.status, href: '/admin/support' })) },
        { group: 'Customers', items: users.map((item: any) => ({ title: item.name, subtitle: item.email || item.phone, href: '/admin/customers' })) },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
