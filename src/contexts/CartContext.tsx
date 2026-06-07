'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  mrp: number;
  size: string;
  color: string;
  colorHex?: string;
  quantity: number;
  maxQuantity: number;
  sku: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  totalSavings: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, size: string, color: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'velruma-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = Math.min(existing.quantity + item.quantity, item.maxQuantity);
        updated[existingIndex] = { ...existing, quantity: newQty };
        return updated;
      }

      return [...prev, item];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size: string, color: string) => {
    setItems((prev) => prev.filter(
      (i) => !(i.productId === productId && i.size === size && i.color === color)
    ));
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, color: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size && item.color === color) {
          return { ...item, quantity: Math.max(1, Math.min(quantity, item.maxQuantity)) };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const isInCart = useCallback((productId: string, size: string, color: string) => {
    return items.some(
      (i) => i.productId === productId && i.size === size && i.color === color
    );
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalSavings = items.reduce((sum, item) => sum + (item.mrp - item.price) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        totalSavings,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
