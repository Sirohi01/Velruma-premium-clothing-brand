'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useWebsiteSettings } from '@/contexts/SettingsContext';

// Inline SVG icons for social media (lucide-react removed brand icons)
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>
  </svg>
);

const footerLinks = {
  shop: [
    { title: 'New Arrivals', href: '/shop?sort=newest' },
    { title: 'Best Sellers', href: '/shop?sort=best-selling' },
    { title: 'Collections', href: '/collections' },
    { title: 'Sale', href: '/shop?sale=true' },
    { title: 'Lookbook', href: '/lookbook' },
  ],
  support: [
    { title: 'Contact Us', href: '/contact' },
    { title: 'Size Guide', href: '/size-guide' },
    { title: 'Track Order', href: '/track-order' },
    { title: 'Returns & Exchanges', href: '/return-policy' },
    { title: 'FAQ', href: '/faq' },
  ],
  policies: [
    { title: 'Shipping Policy', href: '/shipping-policy' },
    { title: 'Return Policy', href: '/return-policy' },
    { title: 'Privacy Policy', href: '/privacy-policy' },
    { title: 'Terms & Conditions', href: '/terms' },
  ],
};

const socialLinks = [
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: TwitterIcon, href: '#', label: 'Twitter' },
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: YoutubeIcon, href: '#', label: 'YouTube' },
];

export default function WebsiteFooter() {
  const { getSetting } = useWebsiteSettings();
  const brandName = getSetting('brand_name', 'VELRUMA');
  const brandLogo = getSetting('brand_logo', '');
  const tagline = getSetting('brand_tagline', 'Elevating everyday style with premium clothing crafted for the modern individual.');
  const email = getSetting('brand_email', 'hello@velruma.com');
  const phone = getSetting('brand_phone', '+91 9999999999');
  const address = getSetting('brand_address', 'Mumbai, Maharashtra, India');

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-white/[0.06] dark:bg-[#07070C]">
      {/* Newsletter Section */}
      <div className="border-b border-zinc-200 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center lg:flex-row lg:justify-between lg:px-8 lg:text-left">
          <div>
            <h3
              className="text-xl font-semibold text-zinc-900 dark:text-white lg:text-2xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Join the {brandName} Family
            </h3>
            <p className="mt-1.5 text-sm text-zinc-500">
              Subscribe for exclusive drops, styling tips & 10% off your first order.
            </p>
          </div>
          <form className="flex w-full max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-colors focus:border-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-amber-500/30"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-xl bg-zinc-900 px-6 text-sm font-medium text-white transition-all hover:bg-zinc-800 dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="h-14 w-auto max-w-[240px] object-contain" />
            ) : (
              <span
                className="text-lg font-bold tracking-[0.2em] text-zinc-900 dark:text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {brandName}
              </span>
            )}
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              {tagline}
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-all hover:border-zinc-400 hover:text-zinc-900 dark:border-white/10 dark:hover:border-amber-500/30 dark:hover:text-amber-400"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Help
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Policies
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.policies.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Contact
            </h4>
            <div className="space-y-3">
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white">
                <Mail className="h-4 w-4 shrink-0" />
                {email}
              </a>
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white">
                <Phone className="h-4 w-4 shrink-0" />
                {phone}
              </a>
              <p className="flex items-start gap-2 text-sm text-zinc-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-200 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 text-center sm:flex-row sm:justify-between lg:px-8">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span>🇮🇳 Made in India</span>
            <span>·</span>
            <span>COD Available</span>
            <span>·</span>
            <span>7 Day Returns</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
