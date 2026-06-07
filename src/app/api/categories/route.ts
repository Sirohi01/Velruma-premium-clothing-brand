import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const featuredOnly = searchParams.get('featured') === 'true';

    const query: any = {};
    if (activeOnly) query.isActive = true;
    if (featuredOnly) query.isFeatured = true;

    // Fetch all categories
    // If needed, we can populate parentCategory to build a tree on the client
    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // In a real app, you would add RBAC check here
    
    const category = await Category.create(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('Categories POST error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
