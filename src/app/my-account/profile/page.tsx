'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Profile</h2>

      {/* Profile Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/[0.06] dark:bg-[#12121A]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {user?.name?.[0]?.toUpperCase() || 'V'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
              {user?.name || 'Customer'}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">{user?.email || 'customer@velruma.com'}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Shield className="h-3 w-3" />
                {user?.role?.name || 'Customer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/[0.06] dark:bg-[#12121A]">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Account Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-white/[0.02]">
            <User className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Full Name</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{user?.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-white/[0.02]">
            <Mail className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Email</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{user?.email || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-white/[0.02]">
            <Phone className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Phone</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{user?.phone || 'Not added'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-white/[0.02]">
            <Calendar className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Loyalty Points</p>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{user?.loyaltyPoints || 0} pts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
