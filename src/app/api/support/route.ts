import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';
import '@/models/User';

function ticketNumber() {
  return `VEL-TKT-${Date.now().toString().slice(-8)}`;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (email) query.email = email.toLowerCase();
    const tickets = await SupportTicket.find(query).populate('customer', 'name email').sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Support GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const ticket = await SupportTicket.create({
      ...body,
      ticketNumber: body.ticketNumber || ticketNumber(),
      messages: body.messages?.length ? body.messages : [{
        senderType: body.senderType || 'customer',
        senderName: body.customerName || 'Customer',
        message: body.message || body.subject,
        attachments: body.attachments || [],
      }],
    });
    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error: any) {
    console.error('Support POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
