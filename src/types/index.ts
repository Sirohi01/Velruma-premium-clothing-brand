import type { Permission, ModuleName } from '@/lib/permissions';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: {
    _id: string;
    name: string;
    slug: string;
    permissions: Record<ModuleName, Partial<Permission>>;
  };
  isActive: boolean;
  loyaltyPoints: number;
}

// Common form types
export interface SelectOption {
  label: string;
  value: string;
}

// Dashboard stats
export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  newCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  activeProducts: number;
  salesTrend: number; // percentage change
  ordersTrend: number;
  revenueTrend: number;
  customersTrend: number;
}

export interface SalesDataPoint {
  date: string;
  sales: number;
  orders: number;
}

export interface TopProduct {
  _id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
}

export interface RecentOrder {
  _id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

// Navigation
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  module?: ModuleName;
  badge?: string | number;
  children?: NavItem[];
}

// Table
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

export interface TableFilter {
  key: string;
  label: string;
  type: 'select' | 'search' | 'date' | 'dateRange';
  options?: SelectOption[];
  placeholder?: string;
}
