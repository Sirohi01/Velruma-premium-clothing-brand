'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWebsiteSettings } from '@/contexts/SettingsContext';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const mainNav = [
  { title: 'Home', href: '/' },
  {
    title: 'Shop',
    href: '/shop',
    children: [
      { title: 'All Products', href: '/shop' },
      { title: 'New Arrivals', href: '/shop?sort=newest' },
      { title: 'Best Sellers', href: '/shop?sort=best-selling' },
      { title: 'Sale', href: '/shop?sale=true' },
    ],
  },
  { title: 'Collections', href: '/collections' },
  { title: 'Lookbook', href: '/lookbook' },
  { title: 'Blog', href: '/blog' },
  { title: 'About', href: '/about' },
  { title: 'Contact', href: '/contact' },
];

export default function WebsiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<any | null>(null);
  const [popup, setPopup] = useState<any | null>(null);
  const [popupClosed, setPopupClosed] = useState(false);
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { getSetting } = useWebsiteSettings();
  const brandName = getSetting('brand_name', 'VELRUMA');
  const brandLogo = getSetting('brand_logo', '');
  const freeShippingThreshold = getSetting('free_shipping_threshold', '999');
  const couponCode = getSetting('welcome_coupon_code', 'VELRUMA10');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch('/api/announcements?status=active')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        const now = Date.now();
        const active = data.data.filter((item: any) => {
          const starts = item.startsAt ? new Date(item.startsAt).getTime() : 0;
          const ends = item.endsAt ? new Date(item.endsAt).getTime() : Infinity;
          return starts <= now && ends >= now;
        });
        setAnnouncement(active.find((item: any) => item.placement === 'website_bar') || null);
        setPopup(active.find((item: any) => item.placement === 'popup') || null);
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#EFE2CC] px-4 py-2 text-center text-xs font-semibold tracking-wide text-zinc-800">
        {announcement ? (
          announcement.link ? <Link href={announcement.link} className="text-amber-300">{announcement.message}</Link> : announcement.message
        ) : (
          <>FREE SHIPPING ON ORDERS ABOVE Rs.{freeShippingThreshold} - USE CODE <span className="text-amber-700">{couponCode}</span> FOR 10% OFF</>
        )}
      </div>

      {popup && !popupClosed && (
        <div className="fixed inset-x-4 top-24 z-50 mx-auto max-w-md rounded-xl border border-amber-400/30 bg-zinc-950 p-5 text-white shadow-2xl shadow-black/40">
          <button onClick={() => setPopupClosed(true)} className="absolute right-3 top-3 rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
          <h2 className="pr-8 text-lg font-semibold">{popup.title}</h2>
          <p className="mt-2 text-sm text-zinc-300">{popup.message}</p>
          {popup.link && (
            <Link href={popup.link} className="mt-4 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black">
              View
            </Link>
          )}
        </div>
      )}

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-500',
          isScrolled
            ? 'border-b border-zinc-200/10 bg-white/95 shadow-sm backdrop-blur-xl dark:bg-[#0A0A0F]/95'
            : 'bg-white dark:bg-[#0A0A0F]'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:h-[72px] lg:px-8">
          {/* Left: Mobile menu + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-zinc-700 dark:text-zinc-300 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center">
              {brandLogo ? (
                <img src={brandLogo} alt={brandName} className="h-11 w-auto max-w-[190px] object-contain lg:h-12 lg:max-w-[240px]" />
              ) : (
                <span className="text-xl font-bold tracking-[0.2em] text-zinc-900 dark:text-white lg:text-2xl"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {brandName}
                </span>
              )}
            </Link>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => (
              <div
                key={item.title}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.title)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors',
                    pathname === item.href
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  )}
                >
                  {item.title}
                  {item.children && (
                    <ChevronDown className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      activeDropdown === item.title && 'rotate-180'
                    )} />
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && activeDropdown === item.title && (
                  <div className="absolute left-0 top-full pt-2">
                    <div className="w-52 overflow-hidden rounded-xl border border-zinc-200/50 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#12121A]">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-lg px-3 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-full p-2.5 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <Link
              href="/wishlist"
              className="rounded-full p-2.5 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
            >
              <Heart className="h-[18px] w-[18px]" />
            </Link>

            <Link
              href={user ? '/my-account' : '/login'}
              className="rounded-full p-2.5 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full p-2.5 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-amber-500 dark:text-black">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full border-b border-zinc-200 bg-white px-4 py-6 shadow-lg dark:border-white/10 dark:bg-[#0A0A0F]">
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search for products, collections..."
                  autoFocus
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 text-base outline-none transition-colors focus:border-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-amber-500/30"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white dark:bg-[#0A0A0F]">
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5 dark:border-white/10">
              {brandLogo ? (
                <img src={brandLogo} alt={brandName} className="h-10 w-auto max-w-[180px] object-contain" />
              ) : (
                <span
                  className="text-lg font-bold tracking-[0.2em] text-zinc-900 dark:text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {brandName}
                </span>
              )}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="px-4 py-4">
              {mainNav.map((item) => (
                <div key={item.title}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block border-b border-zinc-100 px-2 py-3.5 text-sm font-medium tracking-wide uppercase transition-colors dark:border-white/5',
                      pathname === item.href
                        ? 'text-zinc-900 dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-400'
                    )}
                  >
                    {item.title}
                  </Link>
                  {item.children && (
                    <div className="ml-4 border-l border-zinc-100 pl-4 dark:border-white/5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-2.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
