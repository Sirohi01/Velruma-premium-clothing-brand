'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  iconColor = 'from-amber-400/20 to-amber-600/20 text-amber-400',
  className,
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-amber-300 hover:shadow-md',
        className
      )}
    >
      {/* Subtle gradient glow on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-500/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[13px] font-medium text-zinc-500">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-zinc-950">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-[11px] text-zinc-600">{changeLabel}</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110',
            iconColor
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
