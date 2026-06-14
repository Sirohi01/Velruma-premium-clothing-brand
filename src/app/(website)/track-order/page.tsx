'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronRight, Loader2, PackageCheck, Search, Truck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const trackingSteps = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
const closedStatuses = ['Cancelled', 'Returned'];

type TrackOrder = {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress?: { city?: string; state?: string; pincode?: string; country?: string };
  items: Array<{
    title: string;
    slug: string;
    image?: string;
    price: number;
    quantity: number;
    variant?: { size?: string; color?: string; sku?: string };
  }>;
  subtotal: number;
  shippingFee: number;
  codFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string;
  courierName?: string;
  timeline: Array<{ status: string; note?: string; createdAt?: string }>;
  createdAt?: string;
};

function money(value: number) {
  return `Rs.${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;
}

function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusTone(status: string) {
  if (status === 'Delivered' || status === 'Paid') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  if (status === 'Cancelled' || status === 'Returned' || status === 'Failed' || status === 'Refunded') return 'bg-red-50 text-red-700 ring-red-100';
  return 'bg-amber-50 text-amber-700 ring-amber-100';
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="bg-[#f8f5ef] px-4 py-12 text-center text-zinc-500">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const [orderId, setOrderId] = useState(initialOrder);
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentIndex = useMemo(() => {
    if (!order || closedStatuses.includes(order.orderStatus)) return -1;
    return Math.max(0, trackingSteps.indexOf(order.orderStatus));
  }, [order]);

  const lookup = async (event?: React.FormEvent, autoOrderId = orderId) => {
    event?.preventDefault();
    const cleanOrderId = autoOrderId.trim();
    if (!cleanOrderId) {
      setError('Please enter your VELRUMA order ID.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const params = new URLSearchParams({ order: cleanOrderId });
      if (email.trim()) params.set('email', email.trim());
      const response = await fetch(`/api/track-order?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Order not found. Please check your order ID.');
        return;
      }

      setOrder(data.data.order);
    } catch {
      setError('Unable to fetch tracking details right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      lookup(undefined, initialOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder]);

  return (
    <main className="bg-[#f8f5ef] text-zinc-950">
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-12">
        <div className="rounded-[22px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#c45500]">Order Tracking</p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-none sm:text-5xl">Track your VELRUMA order</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
            Enter the order ID from your confirmation email to see payment, dispatch, courier and delivery updates in one place.
          </p>

          <form onSubmit={lookup} className="mt-6 space-y-3 rounded-2xl border border-zinc-200 bg-[#fbfaf7] p-3">
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Order ID</label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="VEL-ORD-78802133-P2Y"
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? 'Checking' : 'Track'}
              </button>
            </div>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Optional email verification"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            />
          </form>

          {error && <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
            <div className="rounded-xl border border-zinc-200 bg-white px-2 py-3">Packed</div>
            <div className="rounded-xl border border-zinc-200 bg-white px-2 py-3">Shipped</div>
            <div className="rounded-xl border border-zinc-200 bg-white px-2 py-3">Delivered</div>
          </div>
        </div>

        <div className="rounded-[22px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          {!order ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-700">
                <Truck className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-serif text-3xl font-bold">Live order updates</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Your status timeline will appear here after you enter an order ID.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Order</p>
                  <h2 className="mt-1 text-2xl font-bold">{order.orderId}</h2>
                  <p className="mt-1 text-sm text-zinc-500">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(order.orderStatus)}`}>{order.orderStatus}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(order.paymentStatus)}`}>{order.paymentStatus}</span>
                </div>
              </div>

              {closedStatuses.includes(order.orderStatus) ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  This order is marked as {order.orderStatus}. Contact support if you need help with this order.
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-200 bg-[#fbfaf7] p-4">
                  <div className="grid gap-3 sm:grid-cols-7">
                    {trackingSteps.map((step, index) => {
                      const done = index <= currentIndex;
                      return (
                        <div key={step} className="relative">
                          <div className={`grid min-h-24 place-items-center rounded-2xl border px-2 text-center ${done ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-zinc-200 bg-white text-zinc-400'}`}>
                            <div className={`mx-auto grid h-7 w-7 place-items-center rounded-full ${done ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                              {done ? <Check className="h-4 w-4" /> : index + 1}
                            </div>
                            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em]">{step}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <InfoCard label="Courier" value={order.courierName || 'Will update after dispatch'} />
                <InfoCard label="Tracking No." value={order.trackingNumber || 'Not assigned yet'} />
                <InfoCard label="Contact" value={`${order.email} / ${order.phone}`} />
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-4 py-3">
                  <h3 className="font-bold">Items in this order</h3>
                </div>
                <div className="divide-y divide-zinc-100">
                  {order.items.map((item, index) => (
                    <div key={`${item.slug}-${index}`} className="flex gap-3 p-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                        {item.image ? (
                          <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" />
                        ) : (
                          <PackageCheck className="m-5 h-6 w-6 text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/product/${item.slug}`} className="line-clamp-1 text-sm font-bold hover:text-amber-700">{item.title}</Link>
                        <p className="mt-1 text-xs text-zinc-500">
                          {[item.variant?.size, item.variant?.color, item.variant?.sku].filter(Boolean).join(' / ') || 'Standard'}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold">{money(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-2xl border border-zinc-200 bg-[#fbfaf7] p-4">
                  <h3 className="font-bold">Delivery area</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode, order.shippingAddress?.country].filter(Boolean).join(', ') || 'Address saved with order'}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-[#fbfaf7] p-4 text-sm">
                  <SummaryRow label="Subtotal" value={money(order.subtotal)} />
                  <SummaryRow label="GST" value={money(order.tax)} />
                  <SummaryRow label="Shipping" value={money(order.shippingFee)} />
                  <SummaryRow label="COD charge" value={money(order.codFee)} />
                  {order.discount > 0 && <SummaryRow label="Discount" value={`-${money(order.discount)}`} />}
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-bold">
                    <span>Total</span>
                    <span>{money(order.total)}</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">Payment: {order.paymentMethod}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <h3 className="font-bold">Timeline</h3>
                <div className="mt-4 space-y-3">
                  {order.timeline.map((entry, index) => (
                    <div key={`${entry.status}-${index}`} className="grid grid-cols-[28px_1fr] gap-3">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{entry.status}</p>
                        <p className="text-xs leading-5 text-zinc-500">{entry.note || 'Status updated'} - {formatDate(entry.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-[#fbfaf7] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-zinc-600">
      <span>{label}</span>
      <span className="font-semibold text-zinc-950">{value}</span>
    </div>
  );
}
