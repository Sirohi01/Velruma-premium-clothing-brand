import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie, verifyToken, type TokenPayload } from '@/lib/auth';
import { hasPermission, MODULE_LABELS, type ActionName, type ModuleName, type Permission } from '@/lib/permissions';
import { logActivity } from '@/lib/activity';
import Role from '@/models/Role';
import User from '@/models/User';

export type AdminContext = {
  token: TokenPayload;
  userName: string;
  roleSlug: string;
  permissions: Record<string, Partial<Permission>>;
};

function mapPermissions(value: unknown): Record<string, Partial<Permission>> {
  if (!value) return {};
  if (value instanceof Map) return Object.fromEntries(value.entries()) as Record<string, Partial<Permission>>;
  if (typeof value === 'object') return value as Record<string, Partial<Permission>>;
  return {};
}

export async function requireAdminAction(
  request: NextRequest,
  module: ModuleName,
  action: ActionName
): Promise<{ ok: true; context: AdminContext } | { ok: false; response: NextResponse }> {
  const token = await getAuthCookie();
  const payload = token ? await verifyToken(token) : null;

  if (!payload?.userId) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const user = await User.findById(payload.userId)
    .select('name email role isActive')
    .populate('role', 'name slug permissions isActive')
    .lean();

  if (!user || user.isActive === false) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const role: any = user.role || {};
  const roleSlug = String(role.slug || payload.roleSlug || '');
  const isSuperAdmin = ['super-admin', 'admin'].includes(roleSlug);
  const permissions = mapPermissions(role.permissions);

  if (!isSuperAdmin && !hasPermission(permissions, module, action)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: `You do not have ${action} permission for ${MODULE_LABELS[module]}` },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    context: {
      token: payload,
      userName: String(user.name || user.email || payload.email || 'Admin'),
      roleSlug,
      permissions,
    },
  };
}

export async function auditAdminAction({
  request,
  context,
  module,
  action,
  entity,
  description,
  metadata,
}: {
  request: NextRequest;
  context: AdminContext;
  module: ModuleName | string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'login' | 'logout' | 'export' | 'import' | 'approve' | 'reject' | 'status_change' | 'other';
  entity?: any;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  await logActivity({
    userId: context.token.userId,
    userName: context.userName,
    action,
    module,
    entityId: entity?._id ? String(entity._id) : undefined,
    entityType: module,
    entityName: entity?.title || entity?.name || entity?.code || entity?.orderNumber || entity?.email || undefined,
    description: description || `${action} ${module}`,
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    metadata,
  });
}

export async function ensureRoleModelRegistered() {
  return Role.modelName;
}
