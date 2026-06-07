import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { phase9Models } from '@/models/Phase9';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import ActivityLog from '@/models/ActivityLog';
import User from '@/models/User';

type ModuleKey = keyof typeof phase9Models;

async function audit(request: NextRequest, moduleKey: string, action: 'create' | 'update' | 'delete', record: any) {
  try {
    const token = await getAuthCookie();
    const payload = token ? await verifyToken(token) : null;
    if (!payload?.userId) return;
    const user = await User.findById(payload.userId).select('name');
    await ActivityLog.create({
      userId: payload.userId,
      userName: user?.name || payload.email || 'Admin',
      action,
      module: moduleKey,
      entityId: record?._id,
      entityType: moduleKey,
      entityName: record?.title || record?.name || record?.supplierName || record?.pageUrl || String(record?._id || ''),
      description: `${action} ${moduleKey} record`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });
  } catch {
    // Audit should never block the admin workflow.
  }
}

export async function listRecords(moduleKey: ModuleKey, request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const query: Record<string, unknown> = {};
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    for (const key of ['entityType', 'entityId', 'pageType', 'accessStatus', 'segment']) {
      const value = searchParams.get(key);
      if (value) query[key] = value;
    }
    const records = await phase9Models[moduleKey].find(query).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function createRecord(moduleKey: ModuleKey, request: NextRequest, defaults: Record<string, unknown> = {}) {
  try {
    await dbConnect();
    const body = await request.json();
    const record = await phase9Models[moduleKey].create({ ...defaults, ...body });
    await audit(request, moduleKey, 'create', record);
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function getRecord(moduleKey: ModuleKey, id: string) {
  try {
    await dbConnect();
    const record = await phase9Models[moduleKey].findById(id).lean();
    if (!record) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function updateRecord(moduleKey: ModuleKey, request: NextRequest, id: string) {
  try {
    await dbConnect();
    const body = await request.json();
    const record = await phase9Models[moduleKey].findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!record) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    await audit(request, moduleKey, 'update', record);
    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function deactivateRecord(moduleKey: ModuleKey, id: string, request?: NextRequest) {
  try {
    await dbConnect();
    const record = await phase9Models[moduleKey].findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
    if (!record) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    if (request) await audit(request, moduleKey, 'delete', record);
    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
