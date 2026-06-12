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

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const guard = await requireAdminAction(request, 'lookbook', 'edit');
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const payload = normalizePayload(await request.json());

    if (!payload.title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    if (payload.type !== 'instagram' && !payload.mediaUrl) {
      return NextResponse.json({ success: false, error: 'Photo/video upload is required' }, { status: 400 });
    }
    if (payload.type === 'instagram' && !payload.instagramUrl) {
      return NextResponse.json({ success: false, error: 'Instagram URL is required' }, { status: 400 });
    }

    const item = await LookbookItem.findByIdAndUpdate(id, payload, { new: true });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Lookbook item not found' }, { status: 404 });
    }

    await auditAdminAction({
      request,
      context: guard.context,
      module: 'lookbook',
      action: 'update',
      entity: item,
      description: `Updated lookbook item ${item.title}`,
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Lookbook PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update lookbook item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const guard = await requireAdminAction(request, 'lookbook', 'delete');
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const item = await LookbookItem.findByIdAndUpdate(
      id,
      { isActive: false, status: 'archived' },
      { new: true }
    );

    if (!item) {
      return NextResponse.json({ success: false, error: 'Lookbook item not found' }, { status: 404 });
    }

    await auditAdminAction({
      request,
      context: guard.context,
      module: 'lookbook',
      action: 'delete',
      entity: item,
      description: `Archived lookbook item ${item.title}`,
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Lookbook DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to archive lookbook item' }, { status: 500 });
  }
}
