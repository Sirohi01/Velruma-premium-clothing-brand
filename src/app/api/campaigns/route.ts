import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MarketingCampaign from '@/models/MarketingCampaign';

export async function GET() {
  try {
    await dbConnect();
    const campaigns = await MarketingCampaign.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('Campaigns GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const campaign = await MarketingCampaign.create(body);
    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error: any) {
    console.error('Campaigns POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
