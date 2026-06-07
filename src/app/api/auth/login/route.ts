import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import '@/models/Role';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { logActivity } from '@/lib/activity';
import '@/models/ActivityLog';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('role', 'name slug permissions');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Check password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const role = user.role as unknown as { name: string; slug: string; _id: string };
    
    if (!role || !role.name || !role.slug) {
      return NextResponse.json(
        { success: false, error: 'User role configuration error' },
        { status: 500 }
      );
    }

    // Generate token
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: role.name,
      roleSlug: role.slug,
    });

    // Set cookie
    await setAuthCookie(token);

    // Update login history
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await User.findByIdAndUpdate(user._id, {
      $push: {
        loginHistory: {
          $each: [{ ip, userAgent, timestamp: new Date() }],
          $slice: -20, // Keep last 20 logins
        },
      },
    });

    await logActivity({
      userId: user._id.toString(),
      userName: user.name,
      action: 'login',
      module: 'auth',
      entityId: user._id.toString(),
      entityType: 'User',
      entityName: user.name,
      description: `${user.name} logged in`,
      ipAddress: ip,
      userAgent,
      metadata: { role: role.slug },
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: {
          _id: role._id,
          name: role.name,
          slug: role.slug,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
