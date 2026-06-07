import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import Supplier from '@/models/Supplier';
import Invoice from '@/models/Invoice';

function escapeCsv(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function csv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return 'message\n"No records found"';
  const headers = Object.keys(rows[0]);
  return [headers.join(','), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))].join('\n');
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const type = new URL(request.url).searchParams.get('type') || 'full';
    const sections: string[] = [];

    if (type === 'products' || type === 'full') {
      const products = await Product.find({}).select('title slug status basePrice salePrice costPrice createdAt').lean();
      sections.push(csv(products.map((item: any) => ({
        type: 'product',
        id: item._id,
        title: item.title,
        slug: item.slug,
        status: item.status,
        mrp: item.basePrice,
        sellingPrice: item.salePrice,
        costPrice: item.costPrice,
        createdAt: item.createdAt,
      }))));
    }

    if (type === 'orders' || type === 'full') {
      const orders = await Order.find({}).select('orderId customerName email phone total paymentStatus orderStatus createdAt').lean();
      sections.push(csv(orders.map((item: any) => ({
        type: 'order',
        id: item._id,
        orderId: item.orderId,
        customer: item.customerName,
        email: item.email,
        phone: item.phone,
        total: item.total,
        paymentStatus: item.paymentStatus,
        orderStatus: item.orderStatus,
        createdAt: item.createdAt,
      }))));
    }

    if (type === 'customers' || type === 'full') {
      const users = await User.find({}).select('name email phone isActive createdAt').lean();
      sections.push(csv(users.map((item: any) => ({
        type: 'customer',
        id: item._id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        isActive: item.isActive,
        createdAt: item.createdAt,
      }))));
    }

    if (type === 'suppliers' || type === 'full') {
      const suppliers = await Supplier.find({}).select('name code type gstNumber isActive createdAt').lean();
      sections.push(csv(suppliers.map((item: any) => ({
        type: 'supplier',
        id: item._id,
        name: item.name,
        code: item.code,
        supplierType: item.type,
        gstNumber: item.gstNumber,
        isActive: item.isActive,
        createdAt: item.createdAt,
      }))));
    }

    if (type === 'invoices' || type === 'full') {
      const invoices = await Invoice.find({}).lean();
      sections.push(csv(invoices.map((item: any) => ({
        type: 'invoice',
        id: item._id,
        invoiceNumber: item.invoiceNumber || item.documentNumber,
        customer: item.customerName || item.billTo?.name,
        total: item.total || item.grandTotal,
        status: item.status,
        createdAt: item.createdAt,
      }))));
    }

    const body = sections.join('\n\n');
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="velruma-${type}-export.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Export failed' }, { status: 500 });
  }
}
