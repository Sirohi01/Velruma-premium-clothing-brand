import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie, removeAuthCookie, verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logActivity } from '@/lib/activity';
import '@/models/ActivityLog';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getAuthCookie();
    const payload = token ? await verifyToken(token) : null;
    if (payload?.userId) {
      const user = await User.findById(payload.userId).select('name');
      await logActivity({
        userId: payload.userId,
        userName: user?.name || payload.email,
        action: 'logout',
        module: 'auth',
        entityId: payload.userId,
        entityType: 'User',
        entityName: user?.name || payload.email,
        description: `${user?.name || payload.email} logged out`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    }
    await removeAuthCookie();
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
