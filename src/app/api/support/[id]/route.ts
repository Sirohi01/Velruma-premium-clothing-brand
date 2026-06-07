import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';
import '@/models/User';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const ticket = await SupportTicket.findById(id).populate('customer', 'name email');
    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Support ticket GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const update = body.reply
      ? { $set: { status: body.status || 'pending', priority: body.priority }, $push: { messages: body.reply } }
      : { $set: body };
    const ticket = await SupportTicket.findByIdAndUpdate(id, update, { returnDocument: 'after', runValidators: true });
    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('Support ticket PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const ticket = await SupportTicket.findByIdAndUpdate(id, { status: 'closed' }, { returnDocument: 'after', runValidators: true });
    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: ticket, message: 'Ticket closed' });
  } catch (error) {
    console.error('Support ticket DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
