import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const subscriber = await Newsletter.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!subscriber) return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: subscriber });
  } catch (error: any) {
    console.error('Newsletter PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const subscriber = await Newsletter.findByIdAndUpdate(id, { status: 'unsubscribed' }, { returnDocument: 'after', runValidators: true });
    if (!subscriber) return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: subscriber, message: 'Subscriber unsubscribed' });
  } catch (error) {
    console.error('Newsletter DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
