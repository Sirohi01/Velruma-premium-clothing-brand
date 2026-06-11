import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { phase9Models } from '@/models/Phase9';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';
import type { ModuleName } from '@/lib/permissions';

type ModuleKey = keyof typeof phase9Models;

function moduleName(moduleKey: ModuleKey): ModuleName {
  return moduleKey as ModuleName;
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseJson(value: unknown) {
  if (!value || typeof value !== 'string') return value || {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function normalizeRecordPayload(moduleKey: ModuleKey, body: Record<string, any>) {
  const payload = { ...body };

  if (moduleKey === 'vendor-portal') {
    payload.allowedActions = toList(payload.allowedActions);
    payload.visiblePurchaseOrders = toList(payload.visiblePurchaseOrders);
    payload.documentChecklist = toList(payload.documentChecklist);
    payload.portalToken = payload.portalToken || `VEL-VENDOR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }

  if (moduleKey === 'timelines') {
    payload.priority = payload.priority || 'normal';
    payload.sourceModule = payload.sourceModule || payload.entityType;
  }

  if (moduleKey === 'seo-audits') {
    payload.recommendations = toList(payload.recommendations);
    payload.lastScannedAt = payload.lastScannedAt || new Date();
  }

  if (moduleKey === 'ai-ready') {
    payload.inputSchema = parseJson(payload.inputSchema);
    payload.outputSchema = parseJson(payload.outputSchema);
    payload.guardrails = toList(payload.guardrails);
  }

  return payload;
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
    const admin = await requireAdminAction(request, moduleName(moduleKey), 'create');
    if (!admin.ok) return admin.response;
    const body = await request.json();
    const record = await phase9Models[moduleKey].create(normalizeRecordPayload(moduleKey, { ...defaults, ...body }));
    await auditAdminAction({ request, context: admin.context, module: moduleKey, action: 'create', entity: record });
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
    const admin = await requireAdminAction(request, moduleName(moduleKey), 'edit');
    if (!admin.ok) return admin.response;
    const body = await request.json();
    const record = await phase9Models[moduleKey].findByIdAndUpdate(id, normalizeRecordPayload(moduleKey, body), { returnDocument: 'after', runValidators: true });
    if (!record) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    await auditAdminAction({ request, context: admin.context, module: moduleKey, action: 'update', entity: record });
    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function deactivateRecord(moduleKey: ModuleKey, id: string, request?: NextRequest) {
  try {
    await dbConnect();
    const admin = request ? await requireAdminAction(request, moduleName(moduleKey), 'delete') : null;
    if (admin && !admin.ok) return admin.response;
    const record = await phase9Models[moduleKey].findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
    if (!record) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    if (request && admin?.ok) await auditAdminAction({ request, context: admin.context, module: moduleKey, action: 'delete', entity: record });
    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
