import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/env';

const JWT_SECRET = new TextEncoder().encode(getJwtSecret());

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: true, message: 'If the account exists, a reset token has been generated.' });
    }

    const resetToken = await new SignJWT({ userId: user._id.toString(), purpose: 'password-reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(JWT_SECRET);

    return NextResponse.json({
      success: true,
      message: 'Password reset token generated. Send it manually to the customer.',
      data: { resetToken },
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
