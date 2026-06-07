import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const expense = await Expense.findByIdAndUpdate(
      id,
      { ...body, amount: Number(body.amount || 0), taxAmount: Number(body.taxAmount || 0) },
      { returnDocument: 'after', runValidators: true }
    );
    if (!expense) return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: expense });
  } catch (error: any) {
    console.error('Expense PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const expense = await Expense.findByIdAndUpdate(id, { status: 'draft' }, { returnDocument: 'after' });
    if (!expense) return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: expense, message: 'Expense moved to draft' });
  } catch (error) {
    console.error('Expense DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
