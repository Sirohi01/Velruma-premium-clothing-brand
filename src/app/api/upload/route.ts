import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const limit = checkRateLimit(`upload:${ip}`, 60, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many uploads. Please try again later.' },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary credentials are not configured' },
        { status: 500, headers: rateLimitHeaders(limit) }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = String(formData.get('folder') || 'uploads');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'File is required' }, { status: 400, headers: rateLimitHeaders(limit) });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Only image/video files are allowed' }, { status: 400, headers: rateLimitHeaders(limit) });
    }

    const maxSize = file.type.startsWith('video/') ? 80 * 1024 * 1024 : 8 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: file.type.startsWith('video/') ? 'Video must be under 80MB' : 'Image must be under 8MB' }, { status: 400, headers: rateLimitHeaders(limit) });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${bytes.toString('base64')}`;
    const result = await uploadImage(dataUri, folder);

    return NextResponse.json({ success: true, data: result }, { headers: rateLimitHeaders(limit) });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
