'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, MapPin, PackageCheck, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useWebsiteSettings } from '@/contexts/SettingsContext';
import ImageUpload from '@/components/shared/ImageUpload';

function numberSetting(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, totalItems, totalSavings, clearCart } = useCart();
  const { getSetting } = useWebsiteSettings();
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

  const freeShippingThreshold = numberSetting(getSetting('free_shipping_threshold', '999'), 999);
  const defaultShippingCharge = numberSetting(getSetting('shipping_charge', '79'), 79);
  const codChargeSetting = numberSetting(getSetting('cod_charge', '49'), 49);
  const gstRate = numberSetting(getSetting('default_gst_rate', '12'), 12);
  const upiId = getSetting('upi_id', '');
  const upiQrImage = getSetting('upi_qr_image', '');
  const shippingCharge = totalAmount > 0 && totalAmount < freeShippingThreshold ? defaultShippingCharge : 0;
  const codCharge = form.paymentMethod === 'COD' ? codChargeSetting : 0;
  const gstEstimate = Math.round((totalAmount * gstRate) / 100);
  const payableAmount = totalAmount + shippingCharge + codCharge + gstEstimate;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!items.length) return toast.error('Your cart is empty');
    if (!/^\d{10}$/.test(form.phone)) return toast.error('Enter a valid 10 digit phone number');
    if (form.paymentMethod === 'UPI' && !form.upiProofImage) return toast.error('Upload UPI payment screenshot');
    setLoading(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        subtotal: totalAmount,
        shippingFee: shippingCharge,
        codFee: codCharge,
        tax: gstEstimate,
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
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">Checkout</h1>
                <p className="mt-1 text-sm text-zinc-500">Add delivery details and confirm your VELRUMA order.</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input label="Full name" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} required />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, '').slice(0, 10) })}
                required
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
              />
              <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              <Input label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} required />
              <Input label="Address line 1" value={form.addressLine1} onChange={(v) => setForm({ ...form, addressLine1: v })} required className="md:col-span-2" />
              <Input label="Address line 2" value={form.addressLine2} onChange={(v) => setForm({ ...form, addressLine2: v })} className="md:col-span-2" />
              <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
              <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-800">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900">Payment</h2>
                <p className="text-sm text-zinc-500">COD and manual UPI proof upload are supported.</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {['COD', 'UPI'].map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${form.paymentMethod === method ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'}`}
                >
                  <input type="radio" checked={form.paymentMethod === method} onChange={() => setForm({ ...form, paymentMethod: method })} className="accent-amber-600" />
                  <span className="font-medium">{method === 'COD' ? 'Cash on Delivery' : 'Manual UPI Proof'}</span>
                </label>
              ))}
            </div>
            {form.paymentMethod === 'UPI' && (
              <div className="mt-3 space-y-3">
                {(upiId || upiQrImage) && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-zinc-800">
                    <p className="font-semibold text-zinc-900">Scan and pay</p>
                    {upiQrImage && (
                      <div className="mt-3 flex justify-center">
                        <img src={upiQrImage} alt="UPI QR Code" className="h-44 w-44 rounded-lg border border-amber-200 bg-white object-contain p-2" />
                      </div>
                    )}
                    <div className="mt-3 grid gap-1.5 text-xs">
                      {upiId && <PaymentDetail label="UPI ID" value={upiId} />}
                      <PaymentDetail label="Amount" value={`Rs.${payableAmount.toLocaleString('en-IN')}`} />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">Upload the payment screenshot after paying.</p>
                  </div>
                )}
                <ImageUpload label="Upload UPI payment screenshot" value={form.upiProofImage} folder="payments" onChange={(v) => setForm({ ...form, upiProofImage: v })} />
              </div>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <TrustItem icon={<Truck className="h-4 w-4" />} title="Fast Dispatch" text="24-48 hour packing" />
            <TrustItem icon={<PackageCheck className="h-4 w-4" />} title="Easy Returns" text="7 day return policy" />
            <TrustItem icon={<ShieldCheck className="h-4 w-4" />} title="Secure Order" text="Protected checkout" />
          </div>
        </form>

        <aside className="h-fit rounded-xl border border-zinc-200 bg-white shadow-sm lg:sticky lg:top-24">
          <div className="border-b border-zinc-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">Order Summary</h2>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">{totalItems} item{totalItems === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div className="max-h-[48vh] space-y-3 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-200 p-6 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-zinc-300" />
                <p className="mt-3 text-sm font-medium text-zinc-700">Your cart is empty</p>
                <Link href="/shop" className="mt-3 inline-flex text-sm font-semibold text-amber-700">Continue shopping</Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}-${item.sku}`} className="flex gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-2.5">
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-300">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:text-amber-700">
                      {item.name}
                    </Link>
                    <div className="mt-1.5 grid gap-0.5 text-xs text-zinc-500">
                      <span>Size: <strong className="font-medium text-zinc-700">{item.size || '-'}</strong></span>
                      <span>Color: <strong className="font-medium text-zinc-700">{item.color || '-'}</strong></span>
                      {item.sku && <span>SKU: <strong className="font-medium text-zinc-700">{item.sku}</strong></span>}
                      <span>Qty: <strong className="font-medium text-zinc-700">{item.quantity}</strong></span>
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-zinc-900">Rs.{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        {item.mrp > item.price && <p className="text-xs text-zinc-400 line-through">Rs.{(item.mrp * item.quantity).toLocaleString('en-IN')}</p>}
                      </div>
                      {item.mrp > item.price && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-bold text-green-700">
                          Save Rs.{((item.mrp - item.price) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-zinc-200 p-4">
            <div className="space-y-2 text-sm">
              <PriceRow label="Subtotal" value={`Rs.${totalAmount.toLocaleString('en-IN')}`} />
              <PriceRow label={`Shipping ${freeShippingThreshold > 0 ? `(free above Rs.${freeShippingThreshold.toLocaleString('en-IN')})` : ''}`} value={shippingCharge === 0 ? 'Free' : `Rs.${shippingCharge.toLocaleString('en-IN')}`} />
              {form.paymentMethod === 'COD' && <PriceRow label="COD charge" value={`Rs.${codCharge.toLocaleString('en-IN')}`} />}
              <PriceRow label={`GST (${gstRate}%)`} value={`Rs.${gstEstimate.toLocaleString('en-IN')}`} muted />
              {totalSavings > 0 && <PriceRow label="Total savings" value={`Rs.${totalSavings.toLocaleString('en-IN')}`} success />}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3">
              <span className="text-base font-bold text-zinc-900">Payable</span>
              <span className="text-xl font-bold text-zinc-900">Rs.{payableAmount.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={submit}
              disabled={loading || !items.length}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-amber-600 px-5 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Placing order...' : 'Place Order'}
            </button>
            <p className="mt-3 text-center text-xs text-zinc-500">By placing this order, you agree to VELRUMA policies.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
  className = '',
  inputMode,
  pattern,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  pattern?: string;
  maxLength?: number;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-sm font-medium text-zinc-700">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-amber-600"
      />
    </label>
  );
}

function TrustItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-800">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
        <p className="text-xs text-zinc-500">{text}</p>
      </div>
    </div>
  );
}

function PaymentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-zinc-500">{label}</span>
      <span className="break-all text-right font-semibold text-zinc-900">{value}</span>
    </div>
  );
}

function PriceRow({ label, value, muted, success }: { label: string; value: string; muted?: boolean; success?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? 'text-zinc-500' : success ? 'font-semibold text-green-700' : 'text-zinc-700'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
