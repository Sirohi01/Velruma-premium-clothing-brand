'use client';

import { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons?active=true');
      const data = await res.json();
      if (data.success) setCoupons(data.data);
    } catch {
      toast.error('Failed to load coupons');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Coupons</h1>
        <p className="mt-2 text-sm text-zinc-400">Active offers available for your next VELRUMA order.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {coupons.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400 md:col-span-2"><Ticket className="mx-auto mb-3 h-8 w-8 opacity-30" />No active coupons right now.</div>
        ) : coupons.map((coupon) => (
          <div key={coupon._id} className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-mono text-lg font-semibold text-amber-300">{coupon.code}</p><p className="mt-1 text-sm font-medium text-white">{coupon.title}</p></div>
              <span className="rounded-full bg-black/30 px-2 py-1 text-xs text-amber-200">{coupon.customerSegment}</span>
            </div>
            <p className="mt-4 text-sm text-zinc-300">{coupon.description || 'Use this coupon during checkout.'}</p>
            <p className="mt-3 text-sm text-zinc-400">Offer: {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`} · Min order ₹{coupon.minOrderValue || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
