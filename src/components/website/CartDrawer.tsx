'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartDrawer() {
  const {
    items,
    updateQuantity,
    removeItem,
    totalAmount,
    totalItems,
    totalSavings,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 p-6 dark:border-white/10">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Cart ({totalItems})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="-mr-2 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-zinc-500">
              <ShoppingBag className="mb-4 h-12 w-12 opacity-20" />
              <p>Your cart is empty.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-6 text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4">
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-1 text-sm font-medium text-zinc-900 dark:text-white">
                          <Link href={`/product/${item.slug}`} onClick={() => setIsCartOpen(false)}>
                            {item.name}
                          </Link>
                        </h3>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                            Rs.{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                          {item.mrp > item.price && (
                            <p className="text-xs text-zinc-400 line-through">
                              Rs.{(item.mrp * item.quantity).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.size} / {item.color}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 dark:hover:bg-zinc-700 dark:hover:text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 dark:hover:bg-zinc-700 dark:hover:text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="text-xs font-medium text-red-500 transition-colors hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-zinc-200 bg-zinc-50 p-6 dark:border-white/10 dark:bg-zinc-900/50">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-medium text-zinc-900 dark:text-white">Subtotal</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                Rs.{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            {totalSavings > 0 && (
              <div className="mb-3 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                <span>You saved</span>
                <span>Rs.{totalSavings.toLocaleString('en-IN')}</span>
              </div>
            )}
            <p className="mb-4 text-xs text-zinc-500">Shipping and taxes calculated at checkout.</p>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-700"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
