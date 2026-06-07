import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MarketingCampaign from '@/models/MarketingCampaign';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const campaign = await MarketingCampaign.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!campaign) return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    console.error('Campaign PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const campaign = await MarketingCampaign.findByIdAndUpdate(id, { status: 'paused' }, { returnDocument: 'after', runValidators: true });
    if (!campaign) return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: campaign, message: 'Campaign paused' });
  } catch (error) {
    console.error('Campaign DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
