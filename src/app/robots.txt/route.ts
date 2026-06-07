import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = getAppUrl();
  return new NextResponse(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /api',
      `Sitemap: ${baseUrl}/sitemap.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain' } }
  );
}
