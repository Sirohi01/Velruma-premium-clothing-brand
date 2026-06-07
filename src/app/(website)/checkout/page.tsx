'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import ImageUpload from '@/components/shared/ImageUpload';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'COD',
    upiProofImage: '',
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!items.length) return toast.error('Your cart is empty');
    setLoading(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        subtotal: totalAmount,
        items,
        shippingAddress: {
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: 'India',
        },
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) return toast.error(data.error || 'Checkout failed');
    clearCart();
    toast.success('Order placed');
    router.push(`/track-order?order=${data.data.order.orderId}`);
  };

  return (
    <div className="bg-[#FAF9F6]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Checkout</h1>
            <p className="mt-2 text-sm text-zinc-500">COD and manual UPI proof upload are supported.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Full name" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} required />
            <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
            <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Input label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} required />
            <Input label="Address line 1" value={form.addressLine1} onChange={(v) => setForm({ ...form, addressLine1: v })} required className="md:col-span-2" />
            <Input label="Address line 2" value={form.addressLine2} onChange={(v) => setForm({ ...form, addressLine2: v })} className="md:col-span-2" />
            <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
            <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required />
          </div>
          <div className="rounded-xl border border-zinc-200 p-4">
            <h2 className="font-semibold text-zinc-900">Payment</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {['COD', 'UPI'].map((method) => (
                <label key={method} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-3 text-sm">
                  <input type="radio" checked={form.paymentMethod === method} onChange={() => setForm({ ...form, paymentMethod: method })} />
                  {method === 'COD' ? 'Cash on Delivery' : 'Manual UPI Proof'}
                </label>
              ))}
            </div>
            {form.paymentMethod === 'UPI' && (
              <div className="mt-4">
                <ImageUpload label="Upload UPI payment screenshot" value={form.upiProofImage} folder="payments" onChange={(v) => setForm({ ...form, upiProofImage: v })} />
              </div>
            )}
          </div>
          <button disabled={loading || !items.length} className="w-full rounded-lg bg-amber-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
        </form>
        <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={`${item.productId}-${item.sku}`} className="flex justify-between gap-4 text-sm">
                <span className="text-zinc-600">{item.name} x {item.quantity}</span>
                <span className="font-medium">INR {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-zinc-200 pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>INR {totalAmount.toLocaleString()}</span></div>
            <div className="mt-2 flex justify-between"><span>Shipping</span><span>{totalAmount >= 999 ? 'Free' : 'INR 79'}</span></div>
            <div className="mt-2 flex justify-between"><span>GST estimate</span><span>INR {Math.round(totalAmount * 0.12).toLocaleString()}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required, className = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1 block text-sm font-medium text-zinc-700">{label}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-amber-600" />
    </label>
  );
}
