import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { Permission, ModuleName } from '@/lib/permissions';

export interface IRole extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  permissions: Map<string, Partial<Permission>>;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema(
  {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    approve: { type: Boolean, default: false },
    export: { type: Boolean, default: false },
    assign: { type: Boolean, default: false },
    changeStatus: { type: Boolean, default: false },
  },
  { _id: false }
);

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    permissions: {
      type: Map,
      of: PermissionSchema,
      default: new Map(),
    },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

RoleSchema.methods.getPermissionsObject = function (): Record<ModuleName, Partial<Permission>> {
  const obj: Record<string, Partial<Permission>> = {};
  if (this.permissions) {
    this.permissions.forEach((value: Partial<Permission>, key: string) => {
      obj[key] = value;
    });
  }
  return obj as Record<ModuleName, Partial<Permission>>;
};

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
