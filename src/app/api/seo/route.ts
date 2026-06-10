import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SeoPage from '@/models/SeoPage';
import { normalizeSeoPayload, scoreSeo, syncAllCmsSeoToSeoPages, syncSeoPageToCms } from '@/lib/seo-sync';

export async function GET() {
  try {
    await dbConnect();
    await syncAllCmsSeoToSeoPages();
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
    const seoPayload = normalizeSeoPayload(body);
    const page = await SeoPage.create({
      ...seoPayload,
      score: body.score ?? scoreSeo(seoPayload, seoPayload.keywords),
    });
    await syncSeoPageToCms(page);
    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error: any) {
    console.error('SEO POST error:', error);
    if (error.code === 11000) return NextResponse.json({ success: false, error: 'SEO path already exists' }, { status: 400 });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
