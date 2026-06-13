'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Gift, Mail, Phone, ShoppingBag, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import LoadingState from '@/components/shared/LoadingState';

function money(value: number) {
  return `INR ${Number(value || 0).toLocaleString('en-IN')}`;
}

function tier(points: number) {
  if (points >= 5000) return 'Platinum';
  if (points >= 2500) return 'Gold';
  if (points >= 1000) return 'Silver';
  return 'Bronze';
}

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/customers/${params.id}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) setData(json.data);
      else toast.error(json.error || 'Customer not found');
    }
    load();
  }, [params.id]);

  if (!data) return <LoadingState label="Loading customer..." />;

  const customer = data.customer;
  const stats = data.stats || {};
  const orders = data.orders || [];
  const points = Number(customer.loyaltyPoints || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/admin/customers" className="mt-1 rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">Customer profile, order history and loyalty summary.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<ShoppingBag className="h-5 w-5" />} label="Orders" value={stats.orders || 0} />
        <Metric icon={<WalletCards className="h-5 w-5" />} label="Total Spend" value={money(stats.revenue || 0)} />
        <Metric icon={<Gift className="h-5 w-5" />} label="Loyalty" value={`${points} pts`} />
        <Metric icon={<Gift className="h-5 w-5" />} label="Tier" value={tier(points)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="font-semibold text-white">Contact</h2>
          <p className="flex items-center gap-2 text-sm text-zinc-400"><Mail className="h-4 w-4 text-amber-400" />{customer.email}</p>
          <p className="flex items-center gap-2 text-sm text-zinc-400"><Phone className="h-4 w-4 text-amber-400" />{customer.phone || '-'}</p>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Status</p>
            <p className="mt-1 font-semibold text-white">{customer.isActive ? 'Active' : 'Inactive'}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Addresses</p>
            <p className="mt-1 text-sm text-zinc-400">{customer.addresses?.length || 0} saved</p>
          </div>
        </aside>

        <section className="rounded-xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-semibold text-white">Order History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm text-zinc-400">
              <thead className="bg-white/5 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-zinc-500">No orders found.</td></tr>
                ) : orders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4"><Link href={`/admin/orders/${order._id}`} className="font-semibold text-white hover:text-amber-300">{order.orderId}</Link></td>
                    <td className="px-5 py-4">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-4">{order.orderStatus}</td>
                    <td className="px-5 py-4">{order.paymentMethod} / {order.paymentStatus}</td>
                    <td className="px-5 py-4 text-right text-white">{money(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
      <div className="mb-3 text-amber-400">{icon}</div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 truncate text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
