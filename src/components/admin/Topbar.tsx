'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import {
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const [showSearch, setShowSearch] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl lg:px-5">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className={cn(
          'relative transition-all duration-300',
          showSearch ? 'w-80' : 'w-64'
        )}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-amber-500 focus:bg-white"
            onFocus={() => setShowSearch(true)}
            onBlur={() => setShowSearch(false)}
          />
          <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
        </button>

        {/* Divider */}
        <div className="mx-1 h-8 w-px bg-zinc-200" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-zinc-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              {user ? getInitials(user.name) : 'VL'}
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-medium text-zinc-900">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-[11px] text-zinc-500">
                {user?.role?.name || 'Super Admin'}
              </p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-zinc-500 lg:block" />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-2xl">
                <div className="border-b border-zinc-100 px-3 py-2.5">
                  <p className="text-sm font-medium text-zinc-900">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-zinc-500">{user?.email || 'admin@velruma.com'}</p>
                </div>
                <div className="py-1">
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-zinc-100 py-1">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
