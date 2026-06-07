'use client';

import { Crown, Gift, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function tier(points: number) {
  if (points >= 5000) return { name: 'Platinum', next: 5000, progress: 100 };
  if (points >= 2500) return { name: 'Gold', next: 5000, progress: Math.round((points / 5000) * 100) };
  if (points >= 1000) return { name: 'Silver', next: 2500, progress: Math.round((points / 2500) * 100) };
  return { name: 'Bronze', next: 1000, progress: Math.round((points / 1000) * 100) };
}

export default function AccountLoyaltyPage() {
  const { user } = useAuth();
  const points = Number(user?.loyaltyPoints || 0);
  const currentTier = tier(points);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Loyalty</h1>
        <p className="mt-2 text-sm text-zinc-400">Track your VELRUMA points and tier progress.</p>
      </div>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm text-amber-200">Current Tier</p><h2 className="mt-1 text-3xl font-semibold text-white">{currentTier.name}</h2></div>
          <Crown className="h-10 w-10 text-amber-300" />
        </div>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm text-zinc-300"><span>{points.toLocaleString('en-IN')} points</span><span>{currentTier.next.toLocaleString('en-IN')} target</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-black/30"><div className="h-full rounded-full bg-amber-400" style={{ width: `${currentTier.progress}%` }} /></div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5"><Star className="mb-3 h-6 w-6 text-amber-300" /><h3 className="font-semibold text-white">Earn Points</h3><p className="mt-2 text-sm text-zinc-400">Points are added from purchases, referrals, and special campaigns.</p></div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5"><Gift className="mb-3 h-6 w-6 text-amber-300" /><h3 className="font-semibold text-white">Redeem Rewards</h3><p className="mt-2 text-sm text-zinc-400">Use points for coupons, loyalty gifts, and VIP offers as they become available.</p></div>
      </div>
    </div>
  );
}
