import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'login' | 'logout' | 'export' | 'import' | 'approve' | 'reject' | 'status_change' | 'other';
  module: string;
  entityId?: mongoose.Types.ObjectId;
  entityType?: string;
  entityName?: string;
  description: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'restore', 'login', 'logout', 'export', 'import', 'approve', 'reject', 'status_change', 'other'],
      required: true,
    },
    module: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    entityType: { type: String },
    entityName: { type: String },
    description: { type: String, required: true },
    changes: [
      {
        field: { type: String },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed },
      },
    ],
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivityLogSchema.index({ userId: 1 });
ActivityLogSchema.index({ module: 1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ entityId: 1, entityType: 1 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
