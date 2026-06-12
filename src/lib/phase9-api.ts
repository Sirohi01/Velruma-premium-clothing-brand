import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Department, Designation, Employee, phase9Models } from '@/models/Phase9';
import Setting from '@/models/Setting';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';
import { notifyTaskAssigned, notifyTaskCompleted } from '@/lib/task-email';
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

function makeCode(value: string, prefix = '') {
  const code = String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 18);
  return `${prefix}${code || Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function generateEmployeeCode() {
  const prefixSetting = await Setting.findOne({ key: 'employee_code_prefix' }).select('value').lean();
  const nextSetting = await Setting.findOne({ key: 'employee_code_next_number' }).select('value').lean();
  const prefix = String(prefixSetting?.value || 'EMP').replace(/[^A-Z0-9-]/gi, '').toUpperCase() || 'EMP';
  const nextNumber = Math.max(1, Number(nextSetting?.value || 1));
  await Setting.findOneAndUpdate(
    { key: 'employee_code_next_number' },
    {
      $set: {
        group: 'team',
        key: 'employee_code_next_number',
        value: nextNumber + 1,
        label: 'Next Employee Code Number',
        description: 'Next auto number for team members.',
        type: 'number',
        isPublic: false,
      },
    },
    { upsert: true }
  );
  return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
}

async function normalizeRecordPayload(moduleKey: ModuleKey, body: Record<string, any>, mode: 'create' | 'update' = 'create') {
  const payload = { ...body };

  if (moduleKey === 'departments') {
    payload.code = payload.code || makeCode(payload.name, 'DEP-');
  }

  if (moduleKey === 'designations') {
    payload.code = payload.code || makeCode(payload.title, 'DES-');
    payload.responsibilities = toList(payload.responsibilities);
  }

  if (moduleKey === 'tasks' && payload.assignedTo) {
    const employee: any = await Employee.findOne({
      $or: [{ employeeCode: payload.assignedTo }, { name: payload.assignedTo }],
      isActive: true,
    }).lean();
    if (employee) {
      payload.assignedTo = employee.name;
      payload.assignedToCode = employee.employeeCode;
    }
  }

  if (moduleKey === 'team') {
    payload.isHod = Boolean(payload.isHod);
    payload.canReceiveReports = Boolean(payload.canReceiveReports || payload.isHod);
    if (mode === 'create') {
      payload.employeeCode = payload.employeeCode || await generateEmployeeCode();
    } else if (!payload.employeeCode) {
      delete payload.employeeCode;
    }
    if (payload.departmentCode) {
      const department: any = await Department.findOne({ code: payload.departmentCode }).lean();
      if (department) {
        payload.department = department.name;
        payload.hod = payload.hod || department.hod;
        payload.hodName = payload.hodName || department.hodName;
      }
    }
    if (payload.designationCode) {
      const designation: any = await Designation.findOne({ code: payload.designationCode }).lean();
      if (designation) {
        payload.designation = designation.title;
        payload.reportingTo = payload.reportingTo || designation.reportingTo;
        payload.reportingToName = payload.reportingToName || designation.reportingToName;
        payload.roleName = payload.roleName || designation.defaultRole;
      }
    }
  }

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
    const record = await phase9Models[moduleKey].create(await normalizeRecordPayload(moduleKey, { ...defaults, ...body }, 'create'));
    await auditAdminAction({ request, context: admin.context, module: moduleKey, action: 'create', entity: record });
    if (moduleKey === 'tasks' && record.assignedTo) await notifyTaskAssigned(record);
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
    const previous = moduleKey === 'tasks' ? await phase9Models[moduleKey].findById(id).lean() : null;
    const record = await phase9Models[moduleKey].findByIdAndUpdate(id, await normalizeRecordPayload(moduleKey, body, 'update'), { returnDocument: 'after', runValidators: true });
    if (!record) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    await auditAdminAction({ request, context: admin.context, module: moduleKey, action: 'update', entity: record });
    if (moduleKey === 'tasks') {
      const assignedChanged = Boolean(record.assignedTo) && (!previous || previous.assignedTo !== record.assignedTo || previous.assignedToCode !== record.assignedToCode);
      const completedNow = record.status === 'done' && previous?.status !== 'done';
      if (assignedChanged) await notifyTaskAssigned(record);
      if (completedNow) await notifyTaskCompleted(record);
    }
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
