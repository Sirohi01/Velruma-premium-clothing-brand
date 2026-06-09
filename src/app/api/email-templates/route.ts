import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailTemplate from '@/models/EmailTemplate';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const templates = await EmailTemplate.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    console.error('Email templates GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const template = await EmailTemplate.create(body);
    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error: unknown) {
    console.error('Email templates POST error:', error);
    const message = error instanceof Error ? error.message : 'Template save failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
