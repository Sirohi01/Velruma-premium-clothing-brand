import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import '@/models/Supplier';

function expenseNumber() {
  return `VEL-EXP-${Date.now().toString().slice(-8)}`;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    if (status) query.status = status;
    const expenses = await Expense.find(query).populate('supplier', 'name code').sort({ expenseDate: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Expenses GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const expense = await Expense.create({
      ...body,
      expenseNumber: body.expenseNumber || expenseNumber(),
      amount: Number(body.amount || 0),
      taxAmount: Number(body.taxAmount || 0),
    });
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error: any) {
    console.error('Expenses POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
