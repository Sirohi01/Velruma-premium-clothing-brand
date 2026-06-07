'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, totalAmount, totalItems, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col dark:bg-zinc-900 transition-transform duration-300">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Cart ({totalItems})
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full dark:hover:bg-white/10 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
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
                  <div className="w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">
                          <Link href={`/product/${item.slug}`} onClick={() => setIsCartOpen(false)}>
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white ml-4">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.size} / {item.color}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-white dark:hover:bg-zinc-700 dark:hover:text-white rounded transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-white dark:hover:bg-zinc-700 dark:hover:text-white rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
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
          <div className="border-t border-zinc-200 p-6 bg-zinc-50 dark:bg-zinc-900/50 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-medium text-zinc-900 dark:text-white">Subtotal</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">₹{totalAmount.toLocaleString()}</span>
            </div>
            <p className="text-xs text-zinc-500 mb-6">Shipping and taxes calculated at checkout.</p>
            
            <Link 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-700"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
