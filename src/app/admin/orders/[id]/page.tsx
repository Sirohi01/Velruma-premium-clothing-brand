'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, FileText, MapPin, Package, Save, Send, Truck, User } from 'lucide-react';
import { toast } from 'sonner';
import LoadingState from '@/components/shared/LoadingState';
import TimelinePanel from '@/components/admin/TimelinePanel';

const statuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
const sourceOptions = ['Website', 'Admin Manual', 'WhatsApp', 'Instagram', 'Flipkart', 'Amazon', 'Other'];
const paymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];

function money(value: number) {
  return `INR ${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ orderStatus: '', paymentStatus: '', trackingNumber: '', courierName: '', adminNotes: '', orderSource: '', sourceReference: '' });

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
        orderSource: order.orderSource || 'Website',
        sourceReference: order.sourceReference || '',
      });
    } else {
      toast.error(json.error || 'Order not found');
    }
  };

  useEffect(() => {
    load();
  }, [params.id]);

  if (!data) return <LoadingState label="Loading order..." />;

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/orders/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (json.success) {
      toast.success('Order updated');
      load();
    } else {
      toast.error(json.error || 'Update failed');
    }
  };

  const sendBusinessDocument = async (document: any) => {
    const res = await fetch(`/api/business-documents/${document._id}/send`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      toast.success('Document sent');
      load();
    } else {
      toast.error(json.error || 'Email failed');
    }
  };

  const sendInvoice = async () => {
    if (!data.invoice?._id) return toast.error('Invoice not found');
    const res = await fetch(`/api/invoices/${data.invoice._id}/send`, { method: 'POST' });
    const json = await res.json();
    if (json.success) toast.success('Invoice sent');
    else toast.error(json.error || 'Invoice email failed');
  };

  const order = data.order;
  const address = order.shippingAddress || {};
  const documents = data.businessDocuments || [];
  const isMarketplaceOrder = ['Flipkart', 'Amazon', 'Other'].includes(order.orderSource) || order.paymentMethod === 'PREPAID';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/admin/orders" className="mt-1 rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{order.orderId}</h1>
              <StatusPill value={order.orderStatus} />
              <StatusPill value={order.paymentStatus} tone={order.paymentStatus === 'Paid' ? 'green' : order.paymentStatus === 'Failed' ? 'red' : 'amber'} />
            </div>
            <p className="mt-1 text-sm text-zinc-500">{order.customerName} - {money(order.total)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.invoice && (
            <>
              <Link href={`/admin/invoices/${data.invoice._id}`} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">
                <FileText className="h-4 w-4" />
                View Invoice
              </Link>
              <button onClick={sendInvoice} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-black hover:bg-emerald-400">
                <Send className="h-4 w-4" />
                Send Invoice
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Order Total" value={money(order.total)} />
        <Metric label="Net Sale" value={money(order.subtotal - order.discount)} />
        <Metric label="Source" value={order.orderSource || 'Website'} />
        <Metric label="Payment" value={`${order.paymentMethod} / ${order.paymentStatus}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <main className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <InfoCard icon={<User className="h-4 w-4" />} title="Customer">
              <p className="font-semibold text-white">{order.customerName}</p>
              <p>{order.email}</p>
              <p>{order.phone}</p>
            </InfoCard>
            <InfoCard icon={<MapPin className="h-4 w-4" />} title="Delivery Address">
              <p>{address.addressLine1 || '-'}</p>
              {address.addressLine2 && <p>{address.addressLine2}</p>}
              <p>{[address.city, address.state, address.pincode].filter(Boolean).join(', ') || '-'}</p>
              <p>{address.country || 'India'}</p>
            </InfoCard>
            <InfoCard icon={<Truck className="h-4 w-4" />} title="Tracking">
              <p>Courier: <span className="text-white">{order.courierName || '-'}</span></p>
              <p>Tracking: <span className="text-white">{order.trackingNumber || '-'}</span></p>
              <p>Source ref: <span className="text-white">{order.sourceReference || '-'}</span></p>
            </InfoCard>
          </div>

          <Card title="Items" icon={<Package className="h-4 w-4" />}>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={`${item.productId}-${item.variant?.sku}`} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[64px_1fr_auto] sm:items-center">
                  <div className="h-16 w-16 overflow-hidden rounded-lg bg-zinc-950">
                    {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{[item.variant?.size, item.variant?.color, item.variant?.sku].filter(Boolean).join(' / ') || '-'}</p>
                    <p className="mt-1 text-xs text-zinc-400">{money(item.price)} x {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{money(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 ml-auto max-w-sm space-y-2 rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm">
              <PriceRow label="Subtotal" value={order.subtotal} />
              {!isMarketplaceOrder && (
                <>
                  <PriceRow label="Shipping" value={order.shippingFee} />
                  <PriceRow label="GST" value={order.tax} />
                  <PriceRow label="COD Fee" value={order.codFee} />
                  <PriceRow label="Discount" value={-order.discount} />
                </>
              )}
              {isMarketplaceOrder && (
                <p className="rounded-lg bg-white/5 p-2 text-xs leading-5 text-zinc-500">Marketplace order: shipping, tax and collection charges are handled on the source portal.</p>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2 font-semibold text-white"><span>Total</span><span>{money(isMarketplaceOrder ? order.subtotal : order.total)}</span></div>
            </div>
          </Card>

          <Card title="Documents" icon={<FileText className="h-4 w-4" />}>
            <div className="grid gap-3 md:grid-cols-2">
              {data.invoice && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{data.invoice.invoiceNumber}</p>
                  <p className="mt-1 text-xs text-zinc-500">Invoice / {data.invoice.status}</p>
                  <div className="mt-3 flex gap-3 text-xs font-semibold">
                    <Link href={`/admin/invoices/${data.invoice._id}`} className="text-amber-400">View</Link>
                    <button onClick={sendInvoice} className="text-emerald-400">Send email</button>
                  </div>
                </div>
              )}
              {documents.map((document: any) => (
                <div key={document._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{document.documentNumber}</p>
                  <p className="mt-1 text-xs capitalize text-zinc-500">{document.documentType} / {document.status}</p>
                  <button onClick={() => sendBusinessDocument(document)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <Send className="h-3.5 w-3.5" />
                    Send email
                  </button>
                </div>
              ))}
              {!data.invoice && documents.length === 0 && <p className="text-sm text-zinc-500">No invoice, estimate, proforma or receipt generated yet.</p>}
            </div>
          </Card>

          <Card title="Order Timeline" icon={<Truck className="h-4 w-4" />}>
            <div className="space-y-4">
              {(order.timeline || []).map((step: any, index: number) => (
                <div key={index} className="relative border-l-2 border-amber-500 pl-4 text-sm">
                  <p className="font-semibold text-white">{step.status}</p>
                  <p className="mt-1 text-zinc-500">{step.note || '-'}</p>
                  <p className="mt-1 text-xs text-zinc-600">{step.createdAt ? new Date(step.createdAt).toLocaleString('en-IN') : ''}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-white/10 pt-5">
              <TimelinePanel entityType="order" entityId={order._id} />
            </div>
          </Card>
        </main>

        <aside className="h-fit space-y-4 rounded-xl border border-white/10 bg-zinc-900 p-5 xl:sticky xl:top-24">
          <div>
            <h2 className="font-semibold text-white">Update Order</h2>
            <p className="mt-1 text-sm text-zinc-500">Status changes send customer emails where applicable.</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <CreditCard className="h-4 w-4 text-amber-400" />
              Payment Review
            </div>
            <p className="mt-2 text-sm text-zinc-400">{order.paymentMethod} / {order.paymentStatus}</p>
            {order.paymentMethod === 'UPI' && order.paymentStatus !== 'Paid' && (
              <p className="mt-3 rounded-lg bg-amber-500/10 p-2 text-xs leading-5 text-amber-200">Check proof first. Mark Paid confirms the order and sends payment receipt.</p>
            )}
            {order.upiProofImage ? (
              <a href={order.upiProofImage} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-lg border border-white/10">
                <img src={order.upiProofImage} alt="UPI payment proof" className="h-40 w-full object-cover" />
              </a>
            ) : (
              <p className="mt-3 text-xs text-zinc-600">No UPI proof uploaded.</p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm({ ...form, paymentStatus: 'Paid' })} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-400">Mark Paid</button>
              <button type="button" onClick={() => setForm({ ...form, paymentStatus: 'Failed' })} className="rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-400">Reject</button>
            </div>
          </div>

          <Select label="Order source" value={form.orderSource} onChange={(value) => setForm({ ...form, orderSource: value })} options={sourceOptions} />
          <Input label="Source reference" value={form.sourceReference} onChange={(value) => setForm({ ...form, sourceReference: value })} />
          <Select label="Order status" value={form.orderStatus} onChange={(value) => setForm({ ...form, orderStatus: value })} options={statuses} />
          <Select label="Payment status" value={form.paymentStatus} onChange={(value) => setForm({ ...form, paymentStatus: value })} options={paymentStatuses} />
          <Input label="Courier" value={form.courierName} onChange={(value) => setForm({ ...form, courierName: value })} />
          <Input label="Tracking number" value={form.trackingNumber} onChange={(value) => setForm({ ...form, trackingNumber: value })} />
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-400">Admin notes</span>
            <textarea value={form.adminNotes} onChange={(event) => setForm({ ...form, adminNotes: event.target.value })} className="w-full rounded-lg border border-white/10 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-amber-500" rows={4} />
          </label>
          <button onClick={save} disabled={saving} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-zinc-900 p-4"><p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-2 truncate text-lg font-semibold text-white">{value}</p></div>;
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-sm text-zinc-400">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">{icon}{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-xl border border-white/10 bg-zinc-900 p-5"><div className="mb-4 flex items-center gap-2 font-semibold text-white">{icon}{title}</div>{children}</section>;
}

function PriceRow({ label, value }: { label: string; value: number }) {
  if (!value) return null;
  return <div className="flex justify-between text-zinc-400"><span>{label}</span><span>{money(value)}</span></div>;
}

function StatusPill({ value, tone = 'amber' }: { value: string; tone?: 'amber' | 'green' | 'red' }) {
  const classes = tone === 'green'
    ? 'bg-emerald-500/10 text-emerald-300'
    : tone === 'red'
      ? 'bg-red-500/10 text-red-300'
      : 'bg-amber-500/10 text-amber-300';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{value}</span>;
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1 block text-sm text-zinc-400">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-amber-500" /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="block"><span className="mb-1 block text-sm text-zinc-400">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-amber-500">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}
