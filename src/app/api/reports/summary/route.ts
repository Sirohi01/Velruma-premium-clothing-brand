import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Expense from '@/models/Expense';
import PurchaseOrder from '@/models/PurchaseOrder';
import '@/models/Category';
import '@/models/Supplier';

function dateRange(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (range === 'all') {
    const start = new Date(0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  const start = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function sum(items: any[], key: string) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function netOrderSale(order: any) {
  return Math.max(0, Number(order.subtotal || 0) - Number(order.discount || 0));
}

function itemProductId(item: any) {
  return String(item.productId || item.product || item.productRef || '');
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { start, end } = dateRange(request);

    const [orders, expenses, purchases, products] = await Promise.all([
      Order.find({ createdAt: { $gte: start, $lte: end } }).lean(),
      Expense.find({ expenseDate: { $gte: start, $lte: end }, status: { $ne: 'draft' } }).lean(),
      PurchaseOrder.find({ createdAt: { $gte: start, $lte: end } }).populate('supplier', 'name code').lean(),
      Product.find({}).populate('category', 'name').lean(),
    ]);

    const activeSalesOrders = orders.filter((order: any) =>
      !['Cancelled', 'Returned'].includes(order.orderStatus) &&
      !['Refunded', 'Failed'].includes(order.paymentStatus)
    );
    const deliveredOrders = orders.filter((order: any) => order.orderStatus === 'Delivered');
    const returnedOrders = orders.filter((order: any) => order.orderStatus === 'Returned');
    const cancelledOrders = orders.filter((order: any) => order.orderStatus === 'Cancelled');
    const paidOrders = orders.filter((order: any) => order.paymentStatus === 'Paid');

    const productCost = new Map(products.map((product: any) => [String(product._id), Number(product.costPrice || 0)]));
    const productCategory = new Map(products.map((product: any) => [String(product._id), product.category?.name || 'Uncategorized']));
    const totalRevenue = activeSalesOrders.reduce((total: number, order: any) => total + netOrderSale(order), 0);
    const grossSales = sum(orders, 'total');
    const taxCollected = sum(activeSalesOrders, 'tax');
    const shippingCollected = sum(activeSalesOrders, 'shippingFee');
    const discounts = sum(activeSalesOrders, 'discount');
    const expenseTotal = sum(expenses, 'amount');
    const expenseTax = sum(expenses, 'taxAmount');
    const purchaseTotal = sum(purchases, 'total');

    const soldItems = activeSalesOrders.flatMap((order: any) => order.items || []);
    const lineCogs = (item: any) => {
      const productId = itemProductId(item);
      const quantity = Number(item.quantity || 0);
      const unitCost = Number(item.costPrice ?? item.unitCost ?? productCost.get(productId) ?? 0);
      return quantity * unitCost;
    };
    const missingCostItems = soldItems.filter((item: any) => {
      const productId = itemProductId(item);
      const quantity = Number(item.quantity || 0);
      const unitCost = Number(item.costPrice ?? item.unitCost ?? productCost.get(productId) ?? 0);
      return quantity > 0 && unitCost <= 0;
    }).length;
    const cogs = soldItems.reduce((total: number, item: any) => total + lineCogs(item), 0);
    const netProfit = totalRevenue - cogs - expenseTotal;

    const productReport = new Map<string, any>();
    const categoryReport = new Map<string, any>();
    const sizeReport = new Map<string, any>();
    const colorReport = new Map<string, any>();
    for (const item of soldItems) {
      const key = itemProductId(item);
      const revenue = Number(item.price || 0) * Number(item.quantity || 0);
      const itemCogs = lineCogs(item);
      const product = productReport.get(key) || { title: item.title, quantity: 0, revenue: 0, cogs: 0, profit: 0 };
      product.quantity += Number(item.quantity || 0);
      product.revenue += revenue;
      product.cogs += itemCogs;
      product.profit = product.revenue - product.cogs;
      productReport.set(key, product);

      const category = productCategory.get(key) || 'Uncategorized';
      const categoryItem = categoryReport.get(category) || { category, quantity: 0, revenue: 0, cogs: 0, profit: 0 };
      categoryItem.quantity += Number(item.quantity || 0);
      categoryItem.revenue += revenue;
      categoryItem.cogs += itemCogs;
      categoryItem.profit = categoryItem.revenue - categoryItem.cogs;
      categoryReport.set(category, categoryItem);

      const size = item.variant?.size || 'N/A';
      const sizeItem = sizeReport.get(size) || { size, quantity: 0, revenue: 0 };
      sizeItem.quantity += Number(item.quantity || 0);
      sizeItem.revenue += revenue;
      sizeReport.set(size, sizeItem);

      const color = item.variant?.color || 'N/A';
      const colorItem = colorReport.get(color) || { color, quantity: 0, revenue: 0 };
      colorItem.quantity += Number(item.quantity || 0);
      colorItem.revenue += revenue;
      colorReport.set(color, colorItem);
    }

    const customerReport = new Map<string, any>();
    for (const order of activeSalesOrders as any[]) {
      const key = order.email;
      const customer = customerReport.get(key) || { name: order.customerName, email: order.email, orders: 0, revenue: 0 };
      customer.orders += 1;
      customer.revenue += netOrderSale(order);
      customerReport.set(key, customer);
    }

    const supplierReport = new Map<string, any>();
    for (const purchase of purchases as any[]) {
      const key = purchase.supplier?._id?.toString() || 'unknown';
      const supplier = supplierReport.get(key) || { name: purchase.supplier?.name || 'Unknown supplier', purchases: 0, total: 0 };
      supplier.purchases += 1;
      supplier.total += Number(purchase.total || 0);
      supplierReport.set(key, supplier);
    }

    const expenseByCategory = new Map<string, any>();
    for (const expense of expenses as any[]) {
      const item = expenseByCategory.get(expense.category) || { category: expense.category, amount: 0, taxAmount: 0 };
      item.amount += Number(expense.amount || 0);
      item.taxAmount += Number(expense.taxAmount || 0);
      expenseByCategory.set(expense.category, item);
    }

    return NextResponse.json({
      success: true,
      data: {
        range: { from: start, to: end },
        kpis: {
          grossSales,
          netSales: totalRevenue,
          orders: orders.length,
          deliveredOrders: deliveredOrders.length,
          cancelledOrders: cancelledOrders.length,
          returnedOrders: returnedOrders.length,
          paidOrders: paidOrders.length,
          taxCollected,
          expenseTax,
          shippingCollected,
          discounts,
          cogs,
          missingCostItems,
          expenses: expenseTotal,
          purchases: purchaseTotal,
          netProfit,
          codOrders: orders.filter((order: any) => order.paymentMethod === 'COD').length,
          upiOrders: orders.filter((order: any) => order.paymentMethod === 'UPI').length,
        },
        products: Array.from(productReport.values()).sort((a, b) => b.revenue - a.revenue),
        categories: Array.from(categoryReport.values()).sort((a, b) => b.revenue - a.revenue),
        sizes: Array.from(sizeReport.values()).sort((a, b) => b.quantity - a.quantity),
        colors: Array.from(colorReport.values()).sort((a, b) => b.quantity - a.quantity),
        customers: Array.from(customerReport.values()).sort((a, b) => b.revenue - a.revenue),
        suppliers: Array.from(supplierReport.values()).sort((a, b) => b.total - a.total),
        expensesByCategory: Array.from(expenseByCategory.values()).sort((a, b) => b.amount - a.amount),
      },
    });
  } catch (error: any) {
    console.error('Reports summary error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
