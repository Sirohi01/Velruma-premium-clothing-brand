import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SeoPage from '@/models/SeoPage';

function scoreSeo(title: string, description: string, keywords: string[]) {
  let score = 30;
  if (title.length >= 30 && title.length <= 65) score += 25;
  if (description.length >= 90 && description.length <= 160) score += 25;
  if (keywords.length > 0) score += 10;
  if (title && description) score += 10;
  return Math.min(100, score);
}

export async function GET() {
  try {
    await dbConnect();
    const pages = await SeoPage.find({}).sort({ path: 1 });
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error('SEO GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const keywords = Array.isArray(body.keywords) ? body.keywords : String(body.keywords || '').split(',').map((item) => item.trim()).filter(Boolean);
    const page = await SeoPage.create({
      ...body,
      keywords,
      score: body.score ?? scoreSeo(body.title || '', body.description || '', keywords),
    });
    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error: any) {
    console.error('SEO POST error:', error);
    if (error.code === 11000) return NextResponse.json({ success: false, error: 'SEO path already exists' }, { status: 400 });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
