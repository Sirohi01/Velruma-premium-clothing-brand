import ActivityLog from '@/models/ActivityLog';

export async function logActivity({
  userId,
  userName,
  action,
  module,
  description,
  entityId,
  entityType,
  entityName,
  ipAddress,
  userAgent,
  metadata,
}: {
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'login' | 'logout' | 'export' | 'import' | 'approve' | 'reject' | 'status_change' | 'other';
  module: string;
  description: string;
  entityId?: string;
  entityType?: string;
  entityName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await ActivityLog.create({
      userId,
      userName,
      action,
      module,
      description,
      entityId,
      entityType,
      entityName,
      ipAddress,
      userAgent,
      metadata,
    });
  } catch (error) {
    console.error('Activity log error:', error);
  }
}
