'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, PackagePlus, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingState from '@/components/shared/LoadingState';
import ImageUpload from '@/components/shared/ImageUpload';

const sourceOptions = ['Admin Manual', 'WhatsApp', 'Instagram', 'Flipkart', 'Amazon', 'Website', 'Other'];
const paymentOptions = [
  { value: 'COD', title: 'COD', description: 'Collect payment on delivery. Order confirms immediately.' },
  { value: 'UPI', title: 'Manual UPI', description: 'Upload proof. Confirm after payment verification.' },
  { value: 'PREPAID', title: 'Marketplace Paid', description: 'Already paid on Flipkart, Amazon, or another portal.' },
];

function money(value: number) {
  return `INR ${Number(value || 0).toLocaleString('en-IN')}`;
}

function isMarketplace(source: string) {
  return ['Flipkart', 'Amazon', 'Other'].includes(source);
}

export default function AdminCreateOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
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
    orderSource: 'Admin Manual',
    sourceReference: '',
  });
  const [lines, setLines] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products?status=active')
      .then((res) => res.json())
      .then((data) => setProducts(data.success ? data.data : []))
      .finally(() => setLoading(false));
  }, []);

  const variants = useMemo(() => products.flatMap((product) => (product.variants || []).map((variant: any) => {
    const price = (product.salePrice && product.salePrice < product.basePrice ? product.salePrice : product.basePrice) + (variant.extraPrice || 0);
    return {
      key: `${product._id}:${variant._id}`,
      productId: product._id,
      name: product.title,
      slug: product.slug,
      image: product.images?.[0]?.url || '',
      price,
      mrp: product.basePrice,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      sku: variant.sku,
      variantId: variant._id,
    };
  })), [products]);

  const filteredVariants = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return variants.slice(0, 18);
    return variants.filter((item) => [item.name, item.sku, item.size, item.color].filter(Boolean).join(' ').toLowerCase().includes(term)).slice(0, 30);
  }, [query, variants]);

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  const updateSource = (orderSource: string) => {
    setForm((prev) => ({
      ...prev,
      orderSource,
      paymentMethod: isMarketplace(orderSource) ? 'PREPAID' : prev.paymentMethod,
    }));
  };

  const addLine = (item: any) => {
    if (item.stock <= 0) return toast.error('This variant is out of stock');
    setLines((prev) => {
      const existing = prev.find((line) => line.variantId === item.variantId);
      if (existing) {
        return prev.map((line) => line.variantId === item.variantId ? { ...line, quantity: Math.min(line.quantity + 1, line.maxQuantity) } : line);
      }
      return [...prev, {
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: item.price,
        mrp: item.mrp,
        size: item.size,
        color: item.color,
        quantity: 1,
        maxQuantity: item.stock,
        sku: item.sku,
        variantId: item.variantId,
      }];
    });
  };

  const setQuantity = (index: number, quantity: number) => {
    setLines((prev) => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(1, Math.min(Number(quantity) || 1, item.maxQuantity)) } : item));
  };

  const submit = async () => {
    if (!lines.length) return toast.error('Add at least one item');
    if (!form.customerName || !form.email || !form.phone) return toast.error('Add customer name, email and phone');
    if (!form.addressLine1 || !form.city || !form.state || !form.pincode) return toast.error('Add complete delivery address');
    if (form.paymentMethod === 'UPI' && !form.upiProofImage) return toast.error('Upload UPI proof for manual payment');
    setSaving(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        subtotal,
        shippingFee: 0,
        codFee: 0,
        tax: 0,
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
    setSaving(false);
    if (data.success) {
      toast.success('Order created');
      const nextUrl = `/admin/orders/${data.data.order._id}`;
      router.push(nextUrl);
      window.location.href = nextUrl;
    } else {
      toast.error(data.error || 'Failed to create order');
    }
  };

  if (loading) return <LoadingState label="Loading products..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Create Order</h1>
          <p className="text-sm text-zinc-500">Build admin, WhatsApp, COD, UPI, Flipkart and Amazon orders from one place.</p>
        </div>
        <div className="grid gap-2 text-xs text-zinc-300 sm:grid-cols-3">
          <Badge label="COD" text="Direct confirmation" />
          <Badge label="UPI" text="Verify then confirm" />
          <Badge label="Portal" text="Already paid" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-5">
          <section className="grid gap-4 rounded-xl border border-white/10 bg-zinc-900 p-5 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <h2 className="font-semibold text-white">Customer Details</h2>
              <p className="text-sm text-zinc-500">These details are used for invoice, tracking and customer emails.</p>
            </div>
            <Input label="Customer name" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} />
            <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, '').slice(0, 10) })} />
            <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Input label="Address line 1" value={form.addressLine1} onChange={(v) => setForm({ ...form, addressLine1: v })} className="lg:col-span-2" />
            <Input label="Address line 2" value={form.addressLine2} onChange={(v) => setForm({ ...form, addressLine2: v })} />
            <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
            <Input label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
          </section>

          <section className="grid gap-4 rounded-xl border border-white/10 bg-zinc-900 p-5 lg:grid-cols-[280px_1fr]">
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-white">Source & Payment</h2>
                <p className="text-sm text-zinc-500">Marketplace orders can be marked already paid.</p>
              </div>
              <Select label="Order source" value={form.orderSource} onChange={updateSource} options={sourceOptions} />
              <Input label="Portal/reference ID" value={form.sourceReference} onChange={(v) => setForm({ ...form, sourceReference: v })} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {paymentOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setForm({ ...form, paymentMethod: option.value })}
                  className={`rounded-xl border p-4 text-left transition ${form.paymentMethod === option.value ? 'border-amber-400 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                >
                  <span className="text-sm font-semibold text-white">{option.title}</span>
                  <span className="mt-2 block text-xs leading-5 text-zinc-500">{option.description}</span>
                </button>
              ))}
              {form.paymentMethod === 'UPI' && (
                <div className="rounded-xl border border-white/10 bg-zinc-950 p-3 md:col-span-3">
                  <ImageUpload label="UPI proof screenshot" value={form.upiProofImage} folder="payments" onChange={(v) => setForm({ ...form, upiProofImage: v })} />
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-zinc-900 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-white">Products</h2>
                <p className="text-sm text-zinc-500">Search products, add multiple variants, then adjust quantities.</p>
              </div>
              <div className="relative md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product, SKU, size..." className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 pl-9 pr-3 text-sm text-white outline-none focus:border-amber-500" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredVariants.map((item) => (
                <button key={item.key} type="button" onClick={() => addLine(item)} className="group flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-amber-400/50 hover:bg-white/10">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-950">
                    {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-zinc-600"><PackagePlus className="h-5 w-5" /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{[item.size, item.color, item.sku].filter(Boolean).join(' / ') || 'Default variant'}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-amber-300">{money(item.price)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.stock > 0 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>Stock {item.stock}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

        </main>

        <aside className="h-fit rounded-xl border border-white/10 bg-zinc-900 p-5 xl:sticky xl:top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Selected Items</h2>
            <span className="text-sm text-zinc-500">{totalQuantity} unit{totalQuantity === 1 ? '' : 's'}</span>
          </div>
          <div className="mt-4 max-h-[44vh] space-y-3 overflow-y-auto pr-1">
            {lines.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">No products added yet.</div>
            ) : lines.map((line, index) => (
              <div key={`${line.variantId}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex gap-3">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-950">
                    {line.image ? <img src={line.image} alt={line.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-white">{line.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{[line.size, line.color, line.sku].filter(Boolean).join(' / ')}</p>
                    <p className="mt-1 text-xs text-zinc-400">{money(line.price)} each</p>
                  </div>
                  <button type="button" onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-300 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex h-9 items-center overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
                    <QtyButton onClick={() => setQuantity(index, line.quantity - 1)}><Minus className="h-4 w-4" /></QtyButton>
                    <input type="number" min="1" max={line.maxQuantity} value={line.quantity} onChange={(e) => setQuantity(index, Number(e.target.value))} className="h-full w-12 bg-transparent text-center text-sm text-white outline-none" />
                    <QtyButton onClick={() => setQuantity(index, line.quantity + 1)}><Plus className="h-4 w-4" /></QtyButton>
                  </div>
                  <span className="text-sm font-semibold text-white">{money(line.price * line.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-white/10 pt-5">
            <h2 className="font-semibold text-white">Order Flow</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <SummaryRow label="Source" value={form.orderSource} />
            <SummaryRow label="Payment" value={paymentOptions.find((item) => item.value === form.paymentMethod)?.title || form.paymentMethod} />
            <SummaryRow label="Items" value={String(totalQuantity)} />
            <SummaryRow label="Subtotal" value={money(subtotal)} strong />
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-zinc-400">
            {form.paymentMethod === 'UPI' && 'Customer gets payment verification email first. After you mark Paid, order confirms and receipt email is sent.'}
            {form.paymentMethod === 'COD' && 'COD order confirms immediately. Payment stays pending until you mark it paid later.'}
            {form.paymentMethod === 'PREPAID' && 'Marketplace paid order confirms immediately, payment is marked paid, and receipt email is sent.'}
          </div>
          <button onClick={submit} disabled={saving || !lines.length} className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-amber-500 px-5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'Creating order...' : 'Create Order'}
          </button>
        </aside>
      </div>
    </div>
  );
}

function Badge({ label, text }: { label: string; text: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"><span className="font-semibold text-white">{label}</span><span className="ml-2 text-zinc-500">{text}</span></div>;
}

function Input({ label, value, onChange, className = '' }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return <label className={className}><span className="mb-1 block text-sm text-zinc-400">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-amber-500" /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="block"><span className="mb-1 block text-sm text-zinc-400">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-amber-500">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function QtyButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex h-full w-9 items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white">{children}</button>;
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between gap-3 ${strong ? 'border-t border-white/10 pt-3 font-semibold text-white' : 'text-zinc-300'}`}><span className="text-zinc-500">{label}</span><span className="text-right">{value}</span></div>;
}
