import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';
import { hashPassword } from '@/lib/auth';
import { syncCustomersFromOrders } from '@/lib/customer-sync';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await syncCustomersFromOrders();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const customerRole = await Role.findOne({ slug: 'customer' }).select('_id').lean();
    const query: any = customerRole ? { role: customerRole._id } : {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires')
      .populate('role', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const role = await Role.findOne({ slug: 'customer' });
    if (!role) return NextResponse.json({ success: false, error: 'Customer role not found. Run seed first.' }, { status: 400 });
    const customer = await User.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: await hashPassword(body.password || 'Velruma@123'),
      role: role._id,
      isActive: body.isActive ?? true,
      loyaltyPoints: Number(body.loyaltyPoints || 0),
      addresses: body.addresses || [],
    });
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Customer save failed' }, { status: 500 });
  }
}
