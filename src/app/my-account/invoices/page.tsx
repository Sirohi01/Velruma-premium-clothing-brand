'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/shared/LoadingState';

export default function AccountInvoicesPage() {
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

  if (loading) return <LoadingState label="Loading invoices..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Invoices</h1>
        <p className="mt-1 text-sm text-zinc-400">Invoices are generated automatically after checkout.</p>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">No invoices found.</div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold text-white">{order.orderId}</p>
            <p className="mt-1 text-sm text-zinc-400">Amount: INR {order.total.toLocaleString()} - Status: {order.paymentStatus}</p>
          </div>
        ))
      )}
    </div>
  );
}
