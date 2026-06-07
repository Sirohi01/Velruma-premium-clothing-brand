import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const query: Record<string, unknown> = {};
    if (stage) query.stage = stage;
    const leads = await Lead.find(query).populate('assignedTo', 'name email').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error('Leads GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const lead = await Lead.create({
      ...body,
      timeline: body.timeline?.length ? body.timeline : body.notes ? [{ type: 'note', note: body.notes }] : [],
    });
    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error: any) {
    console.error('Leads POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
