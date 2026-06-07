import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WebsiteSettingsProvider } from '@/contexts/SettingsContext';
import WebsiteHeader from '@/components/website/Header';
import WebsiteFooter from '@/components/website/Footer';
import CartDrawer from '@/components/website/CartDrawer';

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WebsiteSettingsProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col bg-white dark:bg-[#0A0A0F]">
            <WebsiteHeader />
            <main className="flex-1">{children}</main>
            <WebsiteFooter />
            <CartDrawer />
          </div>
        </CartProvider>
      </WebsiteSettingsProvider>
    </AuthProvider>
  );
}
