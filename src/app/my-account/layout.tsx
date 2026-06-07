'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WebsiteSettingsProvider } from '@/contexts/SettingsContext';
import WebsiteHeader from '@/components/website/Header';
import WebsiteFooter from '@/components/website/Footer';
import {
  User,
  Package,
  MapPin,
  Heart,
  RotateCcw,
  Ticket,
  Gift,
  HeadphonesIcon,
  FileText,
  LogOut,
} from 'lucide-react';

const sideNavItems = [
  { title: 'Profile', href: '/my-account/profile', icon: User },
  { title: 'Orders', href: '/my-account/orders', icon: Package },
  { title: 'Addresses', href: '/my-account/addresses', icon: MapPin },
  { title: 'Wishlist', href: '/my-account/wishlist', icon: Heart },
  { title: 'Returns', href: '/my-account/returns', icon: RotateCcw },
  { title: 'Coupons', href: '/my-account/coupons', icon: Ticket },
  { title: 'Loyalty Points', href: '/my-account/loyalty', icon: Gift },
  { title: 'Support', href: '/my-account/support', icon: HeadphonesIcon },
  { title: 'Invoices', href: '/my-account/invoices', icon: FileText },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0A0A0F]">
      <WebsiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            My Account
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Welcome back, {user?.name || 'Customer'}
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Side Navigation */}
          <aside className="w-full shrink-0 lg:w-56">
            <nav className="space-y-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-white/[0.06] dark:bg-[#12121A]">
              {sideNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                      isActive
                        ? 'bg-white font-medium text-zinc-900 shadow-sm dark:bg-white/5 dark:text-white'
                        : 'text-zinc-500 hover:bg-white hover:text-zinc-900 dark:hover:bg-white/5 dark:hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.title}
                  </Link>
                );
              })}
              <div className="my-1 border-t border-zinc-200 dark:border-white/[0.06]" />
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
      <WebsiteFooter />
    </div>
  );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WebsiteSettingsProvider>
        <CartProvider>
          <DashboardContent>{children}</DashboardContent>
        </CartProvider>
      </WebsiteSettingsProvider>
    </AuthProvider>
  );
}
