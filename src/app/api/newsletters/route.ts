import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET() {
  try {
    await dbConnect();
    const subscribers = await Newsletter.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: subscribers });
  } catch (error) {
    console.error('Newsletters GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const subscriber = await Newsletter.findOneAndUpdate(
      { email: body.email?.toLowerCase() },
      { ...body, status: body.status || 'subscribed' },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    return NextResponse.json({ success: true, data: subscriber }, { status: 201 });
  } catch (error: any) {
    console.error('Newsletters POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
