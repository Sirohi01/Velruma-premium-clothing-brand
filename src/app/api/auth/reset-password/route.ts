import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { getJwtSecret } from '@/lib/env';

const JWT_SECRET = new TextEncoder().encode(getJwtSecret());

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { token, password } = await request.json();
    if (!token || !password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Valid token and password are required' }, { status: 400 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.purpose !== 'password-reset' || !payload.userId) {
      return NextResponse.json({ success: false, error: 'Invalid reset token' }, { status: 400 });
    }

    await User.findByIdAndUpdate(payload.userId, { password: await hashPassword(password) });
    return NextResponse.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, error: 'Invalid or expired reset token' }, { status: 400 });
  }
}
