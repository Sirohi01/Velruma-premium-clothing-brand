import Link from 'next/link';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import StatusBadge from '@/components/shared/StatusBadge';

export default async function AdminOrdersPage() {
  await dbConnect();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-zinc-500">Manage order lifecycle, tracking, and payment status.</p>
        </div>
        <Link href="/admin/orders/create" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400">
          Create Manual Order
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order: any) => (
              <tr key={order._id.toString()} className="text-zinc-300">
                <td className="px-5 py-3"><Link href={`/admin/orders/${order._id}`} className="font-medium text-amber-400">{order.orderId}</Link></td>
                <td className="px-5 py-3">{order.customerName}<br /><span className="text-xs text-zinc-500">{order.email}</span></td>
                <td className="px-5 py-3">{order.orderSource || 'Website'}<br /><span className="text-xs text-zinc-500">{order.sourceReference || '-'}</span></td>
                <td className="px-5 py-3">INR {order.total.toLocaleString()}</td>
                <td className="px-5 py-3"><StatusBadge value={String(order.orderStatus).toLowerCase()} /></td>
                <td className="px-5 py-3">{order.paymentMethod} / {order.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
