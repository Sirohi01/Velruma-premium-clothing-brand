import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { LoyaltyTier } from '@/models/Phase9';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const spend = Number(new URL(request.url).searchParams.get('spend') || 0);
    const tiers = await LoyaltyTier.find({ isActive: true }).sort({ minSpend: 1 }).lean();
    const tier = tiers.reduce((matched: any, item: any) => (spend >= Number(item.minSpend || 0) ? item : matched), null);
    return NextResponse.json({
      success: true,
      data: {
        spend,
        tier,
        nextTier: tiers.find((item: any) => Number(item.minSpend || 0) > spend) || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to calculate loyalty tier' }, { status: 500 });
  }
}
