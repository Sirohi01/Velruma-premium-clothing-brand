import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── VELRUMA Business Utilities ───

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateSKU(category: string, name: string, size?: string, color?: string): string {
  const catPrefix = category.substring(0, 3).toUpperCase();
  const namePrefix = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const sizeStr = size ? `-${size.toUpperCase().replace(/[^a-zA-Z0-9]/g, '')}` : '';
  const colorStr = color ? `-${color.substring(0, 3).toUpperCase().replace(/[^a-zA-Z0-9]/g, '')}` : '';
  return `${catPrefix}-${namePrefix}${colorStr}${sizeStr}-${randomStr}`;
}

export function calculateGST(price: number, rate: number = 0.12): { basePrice: number, gstAmount: number } {
  // Assuming price is inclusive of GST
  const basePrice = price / (1 + rate);
  const gstAmount = price - basePrice;
  return { basePrice, gstAmount };
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'V';
}
