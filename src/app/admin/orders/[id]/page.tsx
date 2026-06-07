'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import LoadingState from '@/components/shared/LoadingState';
import TimelinePanel from '@/components/admin/TimelinePanel';

const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState({ orderStatus: '', paymentStatus: '', trackingNumber: '', courierName: '', adminNotes: '' });

  const load = async () => {
    const res = await fetch(`/api/orders/${params.id}`);
    const json = await res.json();
    if (json.success) {
      setData(json.data);
      const order = json.data.order;
      setForm({
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber || '',
        courierName: order.courierName || '',
        adminNotes: order.adminNotes || '',
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!data) return <LoadingState label="Loading order..." />;

  const save = async () => {
    const res = await fetch(`/api/orders/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.success) {
      toast.success('Order updated');
      load();
    } else {
      toast.error(json.error || 'Update failed');
    }
  };

  const order = data.order;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{order.orderId}</h1>
        <p className="text-sm text-zinc-500">{order.customerName} - INR {order.total.toLocaleString()}</p>
        {data.invoice && (
          <Link href={`/admin/invoices/${data.invoice._id}`} className="mt-2 inline-flex text-sm font-medium text-amber-400">
            View invoice {data.invoice.invoiceNumber}
          </Link>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4 rounded-xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="font-semibold text-white">Items</h2>
          {order.items.map((item: any) => (
            <div key={`${item.productId}-${item.variant?.sku}`} className="flex justify-between border-b border-white/5 pb-3 text-sm text-zinc-300 last:border-0">
              <span>{item.title} x {item.quantity}<br /><span className="text-xs text-zinc-500">{item.variant?.size} / {item.variant?.color}</span></span>
              <span>INR {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <h2 className="pt-4 font-semibold text-white">Timeline</h2>
          {(order.timeline || []).map((step: any, index: number) => (
            <div key={index} className="border-l-2 border-amber-500 pl-4 text-sm">
              <p className="font-medium text-white">{step.status}</p>
              <p className="text-zinc-500">{step.note}</p>
              <p className="mt-1 text-xs text-zinc-600">{step.createdAt ? new Date(step.createdAt).toLocaleString('en-IN') : ''}</p>
            </div>
          ))}
        </section>
        <TimelinePanel entityType="order" entityId={order._id} />
        <aside className="space-y-4 rounded-xl border border-white/10 bg-zinc-900 p-5">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold text-white">Payment Review</h2>
            <p className="mt-2 text-sm text-zinc-400">{order.paymentMethod} / {order.paymentStatus}</p>
            {order.upiProofImage ? (
              <a href={order.upiProofImage} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-lg border border-white/10">
                <img src={order.upiProofImage} alt="UPI payment proof" className="h-40 w-full object-cover" />
              </a>
            ) : (
              <p className="mt-3 text-xs text-zinc-600">No UPI proof uploaded.</p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setForm({ ...form, paymentStatus: 'Paid' })} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-400">Mark Paid</button>
              <button onClick={() => setForm({ ...form, paymentStatus: 'Failed' })} className="rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-400">Reject</button>
            </div>
          </div>
          <label className="block"><span className="mb-1 block text-sm text-zinc-400">Order status</span><select value={form.orderStatus} onChange={(e) => setForm({ ...form, orderStatus: e.target.value })} className="h-10 w-full rounded-lg bg-zinc-950 px-3 text-sm text-white">{statuses.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-sm text-zinc-400">Payment status</span><select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })} className="h-10 w-full rounded-lg bg-zinc-950 px-3 text-sm text-white">{['Pending', 'Paid', 'Failed', 'Refunded'].map((s) => <option key={s}>{s}</option>)}</select></label>
          <Input label="Courier" value={form.courierName} onChange={(v) => setForm({ ...form, courierName: v })} />
          <Input label="Tracking number" value={form.trackingNumber} onChange={(v) => setForm({ ...form, trackingNumber: v })} />
          <label className="block"><span className="mb-1 block text-sm text-zinc-400">Admin notes</span><textarea value={form.adminNotes} onChange={(e) => setForm({ ...form, adminNotes: e.target.value })} className="w-full rounded-lg bg-zinc-950 p-3 text-sm text-white" rows={4} /></label>
          <button onClick={save} className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black">Save</button>
        </aside>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1 block text-sm text-zinc-400">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg bg-zinc-950 px-3 text-sm text-white" /></label>;
}
