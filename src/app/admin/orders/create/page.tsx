'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LoadingState from '@/components/shared/LoadingState';
import ImageUpload from '@/components/shared/ImageUpload';

export default function AdminCreateOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [lines, setLines] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products?status=active')
      .then((res) => res.json())
      .then((data) => setProducts(data.success ? data.data : []))
      .finally(() => setLoading(false));
  }, []);

  const variants = useMemo(() => products.flatMap((product) => (product.variants || []).map((variant: any) => ({ product, variant }))), [products]);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  if (loading) return <LoadingState label="Loading products..." />;

  const addLine = (variantKey: string) => {
    const found = variants.find(({ product, variant }) => `${product._id}:${variant._id}` === variantKey);
    if (!found) return;
    const price = (found.product.salePrice && found.product.salePrice < found.product.basePrice ? found.product.salePrice : found.product.basePrice) + (found.variant.extraPrice || 0);
    setLines((prev) => [...prev, {
      productId: found.product._id,
      name: found.product.title,
      slug: found.product.slug,
      image: found.product.images?.[0]?.url || '',
      price,
      mrp: found.product.basePrice,
      size: found.variant.size,
      color: found.variant.color,
      quantity: 1,
      maxQuantity: found.variant.stock,
      sku: found.variant.sku,
      variantId: found.variant._id,
    }]);
  };

  const submit = async () => {
    if (!lines.length) return toast.error('Add at least one item');
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        subtotal,
        items: lines,
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
    if (data.success) {
      toast.success('Manual order created');
      router.push(`/admin/orders/${data.data.order._id}`);
    } else {
      toast.error(data.error || 'Failed to create order');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Manual Order</h1>
        <p className="text-sm text-zinc-500">Create COD/UPI orders from admin for phone or WhatsApp sales.</p>
      </div>
      <section className="grid gap-4 rounded-xl border border-white/10 bg-zinc-900 p-5 md:grid-cols-2">
        <Input label="Customer name" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} />
        <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Input label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
        <Input label="Address line 1" value={form.addressLine1} onChange={(v) => setForm({ ...form, addressLine1: v })} className="md:col-span-2" />
        <Input label="Address line 2" value={form.addressLine2} onChange={(v) => setForm({ ...form, addressLine2: v })} className="md:col-span-2" />
        <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Payment method</span>
          <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="h-10 w-full rounded-lg bg-zinc-950 px-3 text-sm text-white">
            <option value="COD">COD</option>
            <option value="UPI">UPI</option>
          </select>
        </label>
        <div>
          <ImageUpload label="UPI proof screenshot" value={form.upiProofImage} folder="payments" onChange={(v) => setForm({ ...form, upiProofImage: v })} />
        </div>
      </section>
      <section className="rounded-xl border border-white/10 bg-zinc-900 p-5">
        <h2 className="font-semibold text-white">Items</h2>
        <select onChange={(e) => { addLine(e.target.value); e.target.value = ''; }} className="mt-4 h-10 w-full rounded-lg bg-zinc-950 px-3 text-sm text-white">
          <option value="">Add product variant...</option>
          {variants.map(({ product, variant }) => (
            <option key={`${product._id}:${variant._id}`} value={`${product._id}:${variant._id}`}>
              {product.title} - {variant.size}/{variant.color} - Stock {variant.stock}
            </option>
          ))}
        </select>
        <div className="mt-4 space-y-3">
          {lines.map((line, index) => (
            <div key={index} className="grid gap-3 rounded-lg bg-white/5 p-3 text-sm text-zinc-300 md:grid-cols-[1fr_100px_100px_auto]">
              <span>{line.name}<br /><span className="text-xs text-zinc-500">{line.size} / {line.color}</span></span>
              <input type="number" min="1" max={line.maxQuantity} value={line.quantity} onChange={(e) => setLines((prev) => prev.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item))} className="h-9 rounded bg-zinc-950 px-2 text-white" />
              <span className="self-center">INR {(line.price * line.quantity).toLocaleString()}</span>
              <button onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))} className="text-red-400">Remove</button>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-white">Subtotal: INR {subtotal.toLocaleString()}</span>
          <button onClick={submit} className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black">Create Order</button>
        </div>
      </section>
    </div>
  );
}

function Input({ label, value, onChange, className = '' }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return <label className={className}><span className="mb-1 block text-sm text-zinc-400">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg bg-zinc-950 px-3 text-sm text-white" /></label>;
}
