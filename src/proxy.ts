import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

const JWT_SECRET = new TextEncoder().encode(getJwtSecret());

const COOKIE_NAME = 'velruma-token';
const ADMIN_ROUTES = ['/admin'];
const CUSTOMER_ROUTES = ['/my-account'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];
const API_ROUTES = ['/api'];

function getAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isCustomerRoute = CUSTOMER_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isApiRoute = API_ROUTES.some((route) => pathname.startsWith(route));

  if (isApiRoute && request.method === 'OPTIONS') {
    return withSecurityHeaders(new NextResponse(null, { status: 204 }), request);
  }

  if (isAuthRoute && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const roleSlug = payload.roleSlug as string;

      if (roleSlug === 'super-admin' || roleSlug === 'admin') {
        return withSecurityHeaders(NextResponse.redirect(new URL('/admin/dashboard', request.url)), request);
      }
      return withSecurityHeaders(NextResponse.redirect(new URL('/', request.url)), request);
    } catch {
      // Token invalid, let them continue to auth page
    }
  }
  if (isAdminRoute) {
    if (!token) {
      return withSecurityHeaders(NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url)), request);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const roleSlug = payload.roleSlug as string;

      // Only allow admin-level roles
      const adminRoles = [
        'super-admin', 'admin', 'product-manager', 'inventory-manager',
        'order-manager', 'supplier-manager', 'purchase-manager',
        'production-manager', 'qc-manager', 'seo-manager',
        'content-manager', 'sales-executive', 'customer-support', 'accountant',
      ];

      if (!adminRoles.includes(roleSlug)) {
        return withSecurityHeaders(NextResponse.redirect(new URL('/', request.url)), request);
      }
    } catch {
      return withSecurityHeaders(NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url)), request);
    }
  }

  // If customer route, check for authentication
  if (isCustomerRoute) {
    if (!token) {
      return withSecurityHeaders(NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url)), request);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return withSecurityHeaders(NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url)), request);
    }
  }

  return withSecurityHeaders(NextResponse.next(), request);
}

function withSecurityHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const origin = request.headers.get('origin')?.replace(/\/$/, '');
  const allowedOrigins = getAllowedOrigins();
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Seed-Secret');
    response.headers.append('Vary', 'Origin');
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/my-account/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/api/:path*',
  ],
};
