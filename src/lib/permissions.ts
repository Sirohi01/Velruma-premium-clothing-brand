import { type TokenPayload } from './auth';

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
  assign: boolean;
  changeStatus: boolean;
}

export type ModuleName =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'collections'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'crm'
  | 'suppliers'
  | 'purchases'
  | 'production'
  | 'quality'
  | 'returns'
  | 'invoices'
  | 'seo'
  | 'cms'
  | 'blog'
  | 'lookbook'
  | 'coupons'
  | 'marketing'
  | 'support'
  | 'reports'
  | 'accounting'
  | 'roles'
  | 'settings'
  | 'activity'
  | 'notifications'
  | 'tasks'
  | 'team'
  | 'departments'
  | 'designations'
  | 'warehouses'
  | 'stock-transfers'
  | 'media'
  | 'search'
  | 'forms'
  | 'form-submissions'
  | 'backups'
  | 'brand-assets'
  | 'announcements'
  | 'loyalty'
  | 'widgets'
  | 'audit'
  | 'timelines'
  | 'seo-audits'
  | 'vendor-portal'
  | 'brands'
  | 'ai-ready'
  | 'payments'
  | 'estimates'
  | 'proforma-invoices'
  | 'receipts';

export type ActionName = keyof Permission;

export const ALL_MODULES: ModuleName[] = [
  'dashboard', 'products', 'categories', 'collections', 'inventory',
  'orders', 'customers', 'crm', 'suppliers', 'purchases',
  'production', 'quality', 'returns', 'invoices', 'seo',
  'cms', 'blog', 'lookbook', 'coupons', 'marketing', 'support',
  'reports', 'accounting', 'roles', 'settings', 'activity',
  'notifications', 'tasks', 'team', 'departments', 'designations', 'warehouses', 'stock-transfers',
  'media', 'search', 'forms', 'form-submissions', 'backups',
  'brand-assets', 'announcements', 'loyalty', 'widgets', 'audit',
  'timelines', 'seo-audits', 'vendor-portal', 'brands', 'ai-ready',
  'payments', 'estimates', 'proforma-invoices', 'receipts',
];

export const ALL_ACTIONS: ActionName[] = [
  'view', 'create', 'edit', 'delete', 'approve', 'export', 'assign', 'changeStatus',
];

export const MODULE_LABELS: Record<ModuleName, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  collections: 'Collections',
  inventory: 'Inventory',
  orders: 'Orders',
  customers: 'Customers',
  crm: 'CRM & Leads',
  suppliers: 'Suppliers',
  purchases: 'Purchase Management',
  production: 'Production',
  quality: 'Quality Check',
  returns: 'Returns & Exchanges',
  invoices: 'Invoices & Documents',
  seo: 'SEO Management',
  cms: 'CMS Page Builder',
  blog: 'Blog Management',
  lookbook: 'Lookbook Gallery',
  coupons: 'Coupons & Offers',
  marketing: 'Marketing',
  support: 'Support Tickets',
  reports: 'Reports & Analytics',
  accounting: 'Accounting',
  roles: 'Roles & Permissions',
  settings: 'Settings',
  activity: 'Activity Logs',
  notifications: 'Notifications',
  tasks: 'Tasks',
  team: 'Team Management',
  departments: 'Departments',
  designations: 'Designations',
  warehouses: 'Warehouses',
  'stock-transfers': 'Stock Transfers',
  media: 'Media Library',
  search: 'Global Search',
  forms: 'Dynamic Forms',
  'form-submissions': 'Form Submissions',
  backups: 'Backups',
  'brand-assets': 'Brand Assets',
  announcements: 'Announcements',
  loyalty: 'Loyalty Engine',
  widgets: 'Dashboard Widgets',
  audit: 'Audit System',
  timelines: 'Activity Timelines',
  'seo-audits': 'SEO Audits',
  'vendor-portal': 'Vendor Portal',
  brands: 'Brands',
  'ai-ready': 'AI Ready Layer',
  payments: 'Payments',
  estimates: 'Estimates',
  'proforma-invoices': 'Proforma Invoices',
  receipts: 'Receipts',
};

// Permission checking function
export function hasPermission(
  userPermissions: Record<string, Partial<Permission>> | undefined,
  module: ModuleName,
  action: ActionName
): boolean {
  if (!userPermissions) return false;
  const modulePerms = userPermissions[module];
  if (!modulePerms) return false;
  return modulePerms[action] === true;
}

// Create full permission set (for super admin)
export function createFullPermissions(): Record<ModuleName, Permission> {
  const permissions: Record<string, Permission> = {};
  for (const module of ALL_MODULES) {
    permissions[module] = {
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
      export: true,
      assign: true,
      changeStatus: true,
    };
  }
  return permissions as Record<ModuleName, Permission>;
}

// Create view-only permissions (for customer)
export function createViewOnlyPermissions(modules: ModuleName[]): Record<string, Partial<Permission>> {
  const permissions: Record<string, Partial<Permission>> = {};
  for (const module of modules) {
    permissions[module] = { view: true };
  }
  return permissions;
}

// Middleware helper for API routes
export function requirePermission(module: ModuleName, action: ActionName) {
  return async (user: TokenPayload, userPermissions: Record<string, Partial<Permission>>) => {
    if (!hasPermission(userPermissions, module, action)) {
      return { authorized: false, message: `You don't have ${action} permission for ${MODULE_LABELS[module]}` };
    }
    return { authorized: true };
  };
}
