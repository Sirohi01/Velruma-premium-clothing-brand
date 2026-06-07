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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const keywords = Array.isArray(body.keywords) ? body.keywords : String(body.keywords || '').split(',').map((item) => item.trim()).filter(Boolean);
    const page = await SeoPage.findByIdAndUpdate(
      id,
      { ...body, keywords, score: body.score ?? scoreSeo(body.title || '', body.description || '', keywords) },
      { returnDocument: 'after', runValidators: true }
    );
    if (!page) return NextResponse.json({ success: false, error: 'SEO page not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error('SEO PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    await SeoPage.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'SEO page removed' });
  } catch (error) {
    console.error('SEO DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
