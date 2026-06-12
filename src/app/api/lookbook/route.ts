import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';
import LookbookItem, { type LookbookStatus, type LookbookType } from '@/models/LookbookItem';

const TYPES: LookbookType[] = ['photo', 'video', 'instagram'];
const STATUSES: LookbookStatus[] = ['draft', 'published', 'archived'];

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function asTags(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean);
  return asString(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePayload(body: any) {
  const type = TYPES.includes(body?.type) ? body.type : 'photo';
  const status = STATUSES.includes(body?.status) ? body.status : 'published';

  return {
    title: asString(body?.title),
    caption: asString(body?.caption),
    type,
    mediaUrl: asString(body?.mediaUrl),
    instagramUrl: asString(body?.instagramUrl),
    thumbnailUrl: asString(body?.thumbnailUrl),
    alt: asString(body?.alt),
    category: asString(body?.category),
    season: asString(body?.season),
    tags: asTags(body?.tags),
    sortOrder: Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : 0,
    isFeatured: Boolean(body?.isFeatured),
    status,
    isActive: body?.isActive !== false,
  };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, unknown> = {};

    if (searchParams.get('public') === 'true') {
      query.isActive = true;
      query.status = 'published';
    }

    const type = searchParams.get('type');
    if (type && TYPES.includes(type as LookbookType)) query.type = type;

    const category = searchParams.get('category');
    if (category) query.category = category;

    const season = searchParams.get('season');
    if (season) query.season = season;

    if (searchParams.get('featured') === 'true') query.isFeatured = true;

    const items = await LookbookItem.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();
    const activeItems = await LookbookItem.find({ isActive: true, status: 'published' })
      .select('category season')
      .lean();

    return NextResponse.json({
      success: true,
      data: items.map((item: any) => ({ ...item, _id: String(item._id) })),
      filters: {
        categories: Array.from(new Set(activeItems.map((item: any) => item.category).filter(Boolean))).sort(),
        seasons: Array.from(new Set(activeItems.map((item: any) => item.season).filter(Boolean))).sort(),
      },
    });
  } catch (error) {
    console.error('Lookbook GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch lookbook items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const guard = await requireAdminAction(request, 'lookbook', 'create');
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const payload = normalizePayload(body);

    if (!payload.title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    if (payload.type !== 'instagram' && !payload.mediaUrl) {
      return NextResponse.json({ success: false, error: 'Photo/video upload is required' }, { status: 400 });
    }
    if (payload.type === 'instagram' && !payload.instagramUrl) {
      return NextResponse.json({ success: false, error: 'Instagram URL is required' }, { status: 400 });
    }

    const item = await LookbookItem.create(payload);
    await auditAdminAction({
      request,
      context: guard.context,
      module: 'lookbook',
      action: 'create',
      entity: item,
      description: `Created lookbook item ${item.title}`,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error('Lookbook POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create lookbook item' }, { status: 500 });
  }
}
