'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/shared/LoadingState';

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => setOrders(data.success ? data.data : []))
      .finally(() => setLoading(false));
  }, [user?.email]);

  if (loading) return <LoadingState label="Loading orders..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Orders</h1>
        <p className="mt-1 text-sm text-zinc-400">Your order history and delivery timelines.</p>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">No orders found.</div>
      ) : (
        orders.map((order) => (
          <Link key={order._id} href={`/track-order?order=${order.orderId}`} className="block rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{order.orderId}</p>
                <p className="mt-1 text-sm text-zinc-400">{order.items.length} item(s) - INR {order.total.toLocaleString()}</p>
              </div>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">{order.orderStatus}</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
