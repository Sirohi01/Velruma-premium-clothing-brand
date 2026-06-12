'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const trackingSteps = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="bg-[#FAF9F6] px-4 py-12 text-center text-zinc-500">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('order') || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!orderId) return;
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`);
    const data = await res.json();
    setResult(data.success ? data.data : { error: data.error || 'Order not found' });
    setLoading(false);
  };

  return (
    <div className="bg-[#FAF9F6]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-zinc-900">Track Order</h1>
        <form onSubmit={lookup} className="mt-6 flex gap-3 rounded-xl bg-white p-3 shadow-sm">
          <input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="VEL-ORD-..." className="h-11 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-600" />
          <button className="rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white">{loading ? 'Checking...' : 'Track'}</button>
        </form>
        {result?.error && <div className="mt-6 rounded-xl bg-red-50 p-5 text-sm text-red-600">{result.error}</div>}
        {result?.order && (
          <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-zinc-900">{result.order.orderId}</h2>
                <p className="mt-1 text-sm text-zinc-500">{result.order.customerName}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{result.order.orderStatus}</span>
            </div>
            {!['Cancelled', 'Returned'].includes(result.order.orderStatus) && (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {trackingSteps.map((step) => {
                  const currentIndex = trackingSteps.indexOf(result.order.orderStatus);
                  const stepIndex = trackingSteps.indexOf(step);
                  const done = currentIndex >= stepIndex;
                  return (
                    <div key={step} className={`rounded-xl border p-3 text-sm ${done ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-zinc-200 bg-zinc-50 text-zinc-500'}`}>
                      <span className="block text-xs font-semibold uppercase tracking-wide">{done ? 'Done' : 'Pending'}</span>
                      <span className="mt-1 block font-semibold">{step}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-5 grid gap-2 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600 sm:grid-cols-3">
              <p><span className="block text-xs uppercase text-zinc-400">Payment</span>{result.order.paymentMethod} / {result.order.paymentStatus}</p>
              <p><span className="block text-xs uppercase text-zinc-400">Courier</span>{result.order.courierName || '-'}</p>
              <p><span className="block text-xs uppercase text-zinc-400">Tracking</span>{result.order.trackingNumber || '-'}</p>
            </div>
            <div className="mt-5 space-y-3">
              {(result.order.timeline || []).map((step: any, index: number) => (
                <div key={index} className="border-l-2 border-amber-500 pl-4">
                  <p className="text-sm font-medium text-zinc-900">{step.status}</p>
                  <p className="text-xs text-zinc-500">{step.note || new Date(step.createdAt).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            {result.invoice && <p className="mt-5 text-sm text-zinc-500">Invoice: {result.invoice.invoiceNumber}</p>}
          </section>
        )}
      </div>
    </div>
  );
}
