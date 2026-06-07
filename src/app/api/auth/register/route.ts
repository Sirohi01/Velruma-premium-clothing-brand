import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password, phone } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Get customer role
    let customerRole = await Role.findOne({ slug: 'customer' });
    if (!customerRole) {
      // Create customer role if it doesn't exist
      customerRole = await Role.create({
        name: 'Customer',
        slug: 'customer',
        description: 'Regular customer with access to their own dashboard',
        permissions: new Map(),
        isSystem: true,
        isActive: true,
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: customerRole._id,
    });

    // Generate token
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: customerRole.name,
      roleSlug: customerRole.slug,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: {
            name: customerRole.name,
            slug: customerRole.slug,
          },
        },
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
