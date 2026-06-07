import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import SupportTicket from '@/models/SupportTicket';
import { DashboardWidget } from '@/models/Phase9';
import '@/models/Role';

function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function GET() {
  try {
    await dbConnect();
    const today = startOfDay();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const [orders, todayOrders, products, customers, tickets, widgets] = await Promise.all([
      Order.find({ createdAt: { $gte: weekAgo } }).lean(),
      Order.find({ createdAt: { $gte: today } }).lean(),
      Product.find({}).select('title slug basePrice salePrice images variants status category createdAt').populate('category', 'name').lean(),
      User.find({}).select('name email createdAt').limit(8).lean(),
      SupportTicket.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      DashboardWidget.find({ isActive: true, isEnabled: true }).sort({ position: 1 }).lean(),
    ]);

    const revenueToday = todayOrders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
    const lowStockProducts = products.filter((product: any) => (product.variants || []).some((variant: any) => Number(variant.stock || 0) <= 5));
    const activeProducts = products.filter((product: any) => product.status === 'active').length;

    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weekAgo);
      day.setDate(weekAgo.getDate() + index);
      return {
        date: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        key: day.toISOString().slice(0, 10),
        sales: 0,
        orders: 0,
      };
    });

    for (const order of orders as any[]) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      const bucket = days.find((day) => day.key === key);
      if (bucket) {
        bucket.sales += Number(order.total || 0);
        bucket.orders += 1;
      }
    }

    const productSales = new Map<string, any>();
    for (const order of orders as any[]) {
      for (const item of order.items || []) {
        const current = productSales.get(item.slug || item.title) || { name: item.title, sales: 0, revenue: 0 };
        current.sales += Number(item.quantity || 0);
        current.revenue += Number(item.price || 0) * Number(item.quantity || 0);
        productSales.set(item.slug || item.title, current);
      }
    }

    const categoryMap = new Map<string, number>();
    for (const product of products as any[]) {
      const category = product.category?.name || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    }

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          revenueToday,
          ordersToday: todayOrders.length,
          customers: customers.length,
          activeProducts,
          lowStock: lowStockProducts.length,
          openTickets: tickets.filter((ticket: any) => !['resolved', 'closed'].includes(String(ticket.status || '').toLowerCase())).length,
        },
        salesData: days,
        categoryData: Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })).slice(0, 6),
        recentOrders: todayOrders.slice(0, 8).map((order: any) => ({
          id: order.orderId,
          customer: order.customerName,
          total: order.total,
          status: order.orderStatus,
          time: new Date(order.createdAt).toLocaleString('en-IN'),
        })),
        topProducts: Array.from(productSales.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6),
        lowStockProducts: lowStockProducts.slice(0, 5).map((product: any) => ({
          title: product.title,
          stock: Math.min(...(product.variants || []).map((variant: any) => Number(variant.stock || 0))),
        })),
        widgets,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Dashboard summary failed' }, { status: 500 });
  }
}
