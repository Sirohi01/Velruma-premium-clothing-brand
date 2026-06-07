import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  await dbConnect();
  const product = await Product.findOne({ slug: 'velruma-signature-logo-oversized-t-shirt-white' }).lean();
  return NextResponse.json({ videos: product?.videos || [] });
}
