import mongoose, { Schema, type Model } from 'mongoose';

const baseOptions = { timestamps: true };

const NotificationSchema = new Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'stock', 'return', 'supplier', 'support', 'task', 'system'], default: 'system' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  audience: { type: String, enum: ['admin', 'team', 'customer'], default: 'admin' },
  isRead: { type: Boolean, default: false },
  link: String,
  isActive: { type: Boolean, default: true },
}, baseOptions);

const TaskSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  module: { type: String, default: 'crm' },
  assignedTo: String,
  dueDate: Date,
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  status: { type: String, enum: ['todo', 'in_progress', 'done', 'blocked'], default: 'todo' },
  notes: String,
  isActive: { type: Boolean, default: true },
}, baseOptions);

const EmployeeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: String,
  phone: String,
  department: { type: String, default: 'operations' },
  designation: String,
  salary: { type: Number, default: 0 },
  joiningDate: Date,
  performanceScore: { type: Number, default: 3 },
  dailyLog: String,
  isActive: { type: Boolean, default: true },
}, baseOptions);

const WarehouseSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  manager: String,
  phone: String,
  city: String,
  state: String,
  capacity: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, baseOptions);

const StockTransferSchema = new Schema({
  transferNumber: { type: String, required: true, uppercase: true, trim: true },
  fromWarehouse: String,
  toWarehouse: String,
  product: String,
  variant: String,
  quantity: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'in_transit', 'received', 'cancelled'], default: 'draft' },
  notes: String,
  isActive: { type: Boolean, default: true },
}, baseOptions);

const MediaAssetSchema = new Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
  folder: { type: String, default: 'media-library' },
  alt: String,
  size: Number,
  tags: [String],
  isActive: { type: Boolean, default: true },
}, baseOptions);

const DynamicFormSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true },
  purpose: { type: String, enum: ['contact', 'dealer', 'franchise', 'exhibition', 'custom'], default: 'custom' },
  fields: [{
    label: String,
    key: String,
    type: { type: String, enum: ['text', 'email', 'phone', 'number', 'textarea', 'select', 'checkbox'], default: 'text' },
    required: { type: Boolean, default: false },
    options: [String],
  }],
  isActive: { type: Boolean, default: true },
}, baseOptions);

const FormSubmissionSchema = new Schema({
  formId: { type: Schema.Types.ObjectId, ref: 'DynamicForm' },
  formName: String,
  data: Schema.Types.Mixed,
  status: { type: String, enum: ['new', 'reviewed', 'converted', 'rejected'], default: 'new' },
  notes: String,
}, baseOptions);

const AnnouncementSchema = new Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  placement: { type: String, enum: ['website_bar', 'popup', 'admin_dashboard'], default: 'website_bar' },
  startsAt: Date,
  endsAt: Date,
  link: String,
  isActive: { type: Boolean, default: true },
}, baseOptions);

const BrandAssetSchema = new Schema({
  name: { type: String, required: true, trim: true },
  assetType: { type: String, enum: ['logo', 'color', 'font', 'banner', 'campaign'], default: 'banner' },
  url: String,
  value: String,
  notes: String,
  isActive: { type: Boolean, default: true },
}, baseOptions);

const LoyaltyTierSchema = new Schema({
  name: { type: String, required: true, trim: true },
  level: { type: Number, default: 1 },
  minSpend: { type: Number, default: 0 },
  pointsMultiplier: { type: Number, default: 1 },
  benefits: [String],
  isActive: { type: Boolean, default: true },
}, baseOptions);

const DashboardWidgetSchema = new Schema({
  title: { type: String, required: true, trim: true },
  widgetType: { type: String, enum: ['sales', 'orders', 'crm', 'inventory', 'support', 'custom'], default: 'custom' },
  position: { type: Number, default: 0 },
  size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  config: Schema.Types.Mixed,
  isEnabled: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
}, baseOptions);

const BackupJobSchema = new Schema({
  title: { type: String, required: true, trim: true },
  exportType: { type: String, enum: ['products', 'orders', 'customers', 'suppliers', 'invoices', 'full'], default: 'full' },
  status: { type: String, enum: ['ready', 'running', 'completed', 'failed'], default: 'ready' },
  fileUrl: String,
  notes: String,
  isActive: { type: Boolean, default: true },
}, baseOptions);

const ActivityTimelineSchema = new Schema({
  entityType: { type: String, required: true, trim: true },
  entityId: String,
  title: { type: String, required: true, trim: true },
  note: String,
  channel: { type: String, enum: ['call', 'whatsapp', 'email', 'meeting', 'system', 'note'], default: 'note' },
  owner: String,
  dueAt: Date,
  status: { type: String, enum: ['open', 'done', 'cancelled'], default: 'open' },
  isActive: { type: Boolean, default: true },
}, baseOptions);

const SeoAuditSchema = new Schema({
  pageUrl: { type: String, required: true, trim: true },
  pageType: { type: String, enum: ['product', 'category', 'collection', 'blog', 'cms', 'website'], default: 'website' },
  score: { type: Number, default: 0 },
  missingMetaTitle: { type: Boolean, default: false },
  missingMetaDescription: { type: Boolean, default: false },
  missingAltTags: { type: Number, default: 0 },
  duplicateTitle: { type: Boolean, default: false },
  brokenLinks: { type: Number, default: 0 },
  notes: String,
  isActive: { type: Boolean, default: true },
}, baseOptions);

const VendorPortalAccountSchema = new Schema({
  supplierName: { type: String, required: true, trim: true },
  supplierCode: String,
  contactName: String,
  email: String,
  phone: String,
  accessStatus: { type: String, enum: ['invited', 'active', 'suspended'], default: 'invited' },
  allowedActions: [{ type: String, enum: ['view_po', 'update_delivery', 'upload_docs'] }],
  notes: String,
  isActive: { type: Boolean, default: true },
}, baseOptions);

const BrandSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true },
  segment: { type: String, enum: ['core', 'kids', 'sports', 'premium', 'other'], default: 'core' },
  logo: String,
  primaryColor: String,
  supportEmail: String,
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, baseOptions);

const AiReadyConfigSchema = new Schema({
  module: { type: String, required: true, trim: true },
  capability: { type: String, required: true, trim: true },
  promptTemplate: String,
  inputSchema: Schema.Types.Mixed,
  outputSchema: Schema.Types.Mixed,
  isEnabled: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, baseOptions);

function model(name: string, schema: Schema): Model<any> {
  return mongoose.models[name] || mongoose.model(name, schema);
}

export const Notification = model('Notification', NotificationSchema);
export const Task = model('Task', TaskSchema);
export const Employee = model('Employee', EmployeeSchema);
export const Warehouse = model('Warehouse', WarehouseSchema);
export const StockTransfer = model('StockTransfer', StockTransferSchema);
export const MediaAsset = model('MediaAsset', MediaAssetSchema);
export const DynamicForm = model('DynamicForm', DynamicFormSchema);
export const FormSubmission = model('FormSubmission', FormSubmissionSchema);
export const Announcement = model('Announcement', AnnouncementSchema);
export const BrandAsset = model('BrandAsset', BrandAssetSchema);
export const LoyaltyTier = model('LoyaltyTier', LoyaltyTierSchema);
export const DashboardWidget = model('DashboardWidget', DashboardWidgetSchema);
export const BackupJob = model('BackupJob', BackupJobSchema);
export const ActivityTimeline = model('ActivityTimeline', ActivityTimelineSchema);
export const SeoAudit = model('SeoAudit', SeoAuditSchema);
export const VendorPortalAccount = model('VendorPortalAccount', VendorPortalAccountSchema);
export const Brand = model('Brand', BrandSchema);
export const AiReadyConfig = model('AiReadyConfig', AiReadyConfigSchema);

export const phase9Models = {
  notifications: Notification,
  tasks: Task,
  team: Employee,
  warehouses: Warehouse,
  'stock-transfers': StockTransfer,
  media: MediaAsset,
  forms: DynamicForm,
  'form-submissions': FormSubmission,
  announcements: Announcement,
  'brand-assets': BrandAsset,
  loyalty: LoyaltyTier,
  widgets: DashboardWidget,
  backups: BackupJob,
  timelines: ActivityTimeline,
  'seo-audits': SeoAudit,
  'vendor-portal': VendorPortalAccount,
  brands: Brand,
  'ai-ready': AiReadyConfig,
};
