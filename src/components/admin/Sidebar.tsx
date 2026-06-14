'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  Warehouse,
  ShoppingCart,
  Users,
  UserCheck,
  Truck,
  ClipboardList,
  Factory,
  ShieldCheck,
  RotateCcw,
  FileText,
  Search,
  PanelLeft,
  Newspaper,
  Ticket,
  Megaphone,
  HeadphonesIcon,
  BarChart3,
  Calculator,
  Lock,
  Settings,
  Activity,
  Bell,
  BriefcaseBusiness,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  DatabaseBackup,
  Gift,
  Images,
  Palette,
  Puzzle,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigation = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    title: 'Catalog',
    icon: Package,
    children: [
      { title: 'Products', href: '/admin/products', icon: Package },
      { title: 'Categories', href: '/admin/categories', icon: FolderTree },
      { title: 'Collections', href: '/admin/collections', icon: Layers },
    ],
  },
  { title: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { title: 'Customers', href: '/admin/customers', icon: Users },
  { title: 'CRM & Leads', href: '/admin/crm', icon: UserCheck },
  {
    title: 'Supply Chain',
    icon: Truck,
    children: [
      { title: 'Suppliers', href: '/admin/suppliers', icon: Truck },
      { title: 'Purchases', href: '/admin/purchases', icon: ClipboardList },
      { title: 'Production', href: '/admin/production', icon: Factory },
      { title: 'Quality Check', href: '/admin/quality', icon: ShieldCheck },
    ],
  },
  { title: 'Returns', href: '/admin/returns', icon: RotateCcw },
  {
    title: 'Documents',
    icon: FileText,
    children: [
      { title: 'Invoices', href: '/admin/invoices', icon: FileText },
      { title: 'Estimates', href: '/admin/estimates', icon: FileText },
      { title: 'Proforma', href: '/admin/proforma-invoices', icon: FileText },
      { title: 'Receipts', href: '/admin/receipts', icon: FileText },
    ],
  },
  {
    title: 'Content',
    icon: PanelLeft,
    children: [
      { title: 'SEO Manager', href: '/admin/seo', icon: Search },
      { title: 'Homepage', href: '/admin/homepage', icon: PanelLeft },
      { title: 'CMS Pages', href: '/admin/cms', icon: PanelLeft },
      { title: 'Lookbook', href: '/admin/lookbook', icon: Images },
      { title: 'Blog', href: '/admin/blog', icon: Newspaper },
    ],
  },
  { title: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { title: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { title: 'Support', href: '/admin/support', icon: HeadphonesIcon },
  {
    title: 'Enterprise',
    icon: BriefcaseBusiness,
    children: [
      { title: 'Notifications', href: '/admin/notifications', icon: Bell },
      { title: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
      { title: 'Team', href: '/admin/team', icon: Users },
      { title: 'Departments', href: '/admin/departments', icon: BriefcaseBusiness },
      { title: 'Designations', href: '/admin/designations', icon: UserCheck },
      { title: 'Warehouses', href: '/admin/warehouses', icon: Warehouse },
      { title: 'Stock Transfers', href: '/admin/stock-transfers', icon: RotateCcw },
      { title: 'Media Library', href: '/admin/media', icon: Images },
      { title: 'Global Search', href: '/admin/search', icon: Search },
      { title: 'Forms', href: '/admin/forms', icon: FileText },
      { title: 'Form Submissions', href: '/admin/form-submissions', icon: ClipboardList },
      { title: 'Backups', href: '/admin/backups', icon: DatabaseBackup },
      { title: 'Brand Assets', href: '/admin/brand-assets', icon: Palette },
      { title: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      { title: 'Loyalty', href: '/admin/loyalty', icon: Gift },
      { title: 'Widgets', href: '/admin/widgets', icon: Puzzle },
      { title: 'Audit', href: '/admin/audit', icon: Activity },
    ],
  },
  {
    title: 'Scale Ready',
    icon: Layers,
    children: [
      { title: 'Activity Timelines', href: '/admin/timelines', icon: Activity },
      { title: 'SEO Audit', href: '/admin/seo-audit', icon: Search },
      { title: 'Vendor Portal', href: '/admin/vendor-portal', icon: Truck },
      { title: 'Brands', href: '/admin/brands', icon: Layers },
      { title: 'AI Ready', href: '/admin/ai-ready', icon: Puzzle },
    ],
  },
  { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { title: 'Accounting', href: '/admin/accounting', icon: Calculator },
  {
    title: 'System',
    icon: Settings,
    children: [
      { title: 'Roles & Permissions', href: '/admin/roles', icon: Lock },
      { title: 'Settings', href: '/admin/settings', icon: Settings },
      { title: 'Activity Logs', href: '/admin/activity', icon: Activity },
    ],
  },
];

function NavItem({
  item,
  isCollapsed,
  pathname,
}: {
  item: (typeof navigation)[0];
  isCollapsed: boolean;
  pathname: string;
}) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if ('children' in item && item.children) {
      return item.children.some((child) => pathname.startsWith(child.href));
    }
    return false;
  });

  const Icon = item.icon;

  // Has children — group
  if ('children' in item && item.children) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
            'text-zinc-600 hover:bg-[#f6efe3] hover:text-zinc-950',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            </>
          )}
        </button>

        {!isCollapsed && isExpanded && (
          <div className="ml-4 mt-1 space-y-0.5 border-l border-zinc-200 pl-2.5">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const isActive = pathname.startsWith(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  prefetch={false}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-amber-100 to-transparent text-amber-700 font-medium'
                      : 'text-zinc-500 hover:bg-[#f6efe3] hover:text-zinc-900'
                  )}
                >
                  <ChildIcon className="h-4 w-4 shrink-0" />
                  <span>{child.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Single item
  const href = 'href' in item ? item.href : '#';
  const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 shadow-sm'
          : 'text-zinc-600 hover:bg-[#f6efe3] hover:text-zinc-950',
        isCollapsed && 'justify-center px-2'
      )}
      title={isCollapsed ? (item.title as string) : undefined}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!isCollapsed && <span>{item.title as string}</span>}
    </Link>
  );
}

export default function AdminSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [brand, setBrand] = useState({ name: 'VELRUMA', logo: '' });

  useEffect(() => {
    fetch('/api/settings?public=true', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        const settings = (data.data || []).reduce((map: Record<string, string>, item: { key: string; value: unknown }) => {
          map[item.key] = item.value == null ? '' : String(item.value);
          return map;
        }, {});
        setBrand({
          name: settings.brand_name || 'VELRUMA',
          logo: settings.brand_logo || '',
        });
      })
      .catch(() => setBrand({ name: 'VELRUMA', logo: '' }));
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-zinc-200/90 bg-white/95 transition-all duration-300 backdrop-blur',
          'lg:relative lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-[68px]' : 'w-[252px]'
        )}
      >
        {/* Logo */}
        <div className="flex h-13 items-center justify-between border-b border-zinc-200/80 px-3">
          {!isCollapsed ? (
            <Link href="/admin/dashboard" prefetch={false} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="text-sm font-bold text-zinc-950">{brand.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <span className="text-[15px] font-semibold tracking-wider text-zinc-950">
                  {brand.name}
                </span>
                <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                  ADMIN
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/admin/dashboard" prefetch={false} className="mx-auto">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="text-sm font-bold text-zinc-950">{brand.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </Link>
          )}

          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2.5 scrollbar-thin scrollbar-track-transparent">
          {navigation.map((item, index) => (
            <NavItem
              key={item.title + index}
              item={item}
              isCollapsed={isCollapsed}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden border-t border-zinc-200 p-3 lg:block">
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isCollapsed && 'rotate-180'
              )}
            />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
