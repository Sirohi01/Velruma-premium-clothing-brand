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
  | 'coupons'
  | 'marketing'
  | 'support'
  | 'reports'
  | 'accounting'
  | 'roles'
  | 'settings'
  | 'activity';

export type ActionName = keyof Permission;

export const ALL_MODULES: ModuleName[] = [
  'dashboard', 'products', 'categories', 'collections', 'inventory',
  'orders', 'customers', 'crm', 'suppliers', 'purchases',
  'production', 'quality', 'returns', 'invoices', 'seo',
  'cms', 'blog', 'coupons', 'marketing', 'support',
  'reports', 'accounting', 'roles', 'settings', 'activity',
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
  coupons: 'Coupons & Offers',
  marketing: 'Marketing',
  support: 'Support Tickets',
  reports: 'Reports & Analytics',
  accounting: 'Accounting',
  roles: 'Roles & Permissions',
  settings: 'Settings',
  activity: 'Activity Logs',
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
