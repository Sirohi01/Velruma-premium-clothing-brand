import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import '@/models/Role';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const customer = await User.findById(id).select('-password -passwordResetToken -passwordResetExpires').populate('role', 'name slug').lean();
    if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    delete body.password;
    const customer = await User.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true }).select('-password');
    if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Customer update failed' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const customer = await User.findByIdAndUpdate(id, { isActive: false, deletedAt: new Date() }, { returnDocument: 'after' });
    if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Customer deactivate failed' }, { status: 500 });
  }
}
