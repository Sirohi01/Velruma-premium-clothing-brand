'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount, totalItems } = useCart();

  return (
    <div className="bg-[#FAF9F6]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold text-zinc-900">Cart</h1>
        {items.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-zinc-300" />
            <p className="text-zinc-500">Your cart is empty.</p>
            <Link href="/shop" className="mt-6 inline-flex rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white">Shop now</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
                  <div className="h-28 w-24 overflow-hidden rounded-lg bg-zinc-100">
                    {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link href={`/product/${item.slug}`} className="font-medium text-zinc-900">{item.name}</Link>
                        <p className="mt-1 text-sm text-zinc-500">{item.size} / {item.color}</p>
                      </div>
                      <p className="font-semibold text-zinc-900">INR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-lg bg-zinc-100 p-1">
                        <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.size, item.color)} className="text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="h-fit rounded-xl bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-zinc-900">Summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><span>Items</span><span>{totalItems}</span></div>
                <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold"><span>Total</span><span>INR {totalAmount.toLocaleString()}</span></div>
              </div>
              <Link href="/checkout" className="mt-5 flex w-full justify-center rounded-lg bg-amber-600 px-5 py-3 text-sm font-bold text-white">Checkout</Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
