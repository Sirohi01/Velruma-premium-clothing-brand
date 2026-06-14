import type { NextRequest } from 'next/server';

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export function paginationFromRequest(request: NextRequest, defaults = { page: 1, limit: 20 }) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') || defaults.page || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || defaults.limit || 20)));
  const skip = (page - 1) * limit;
  const enabled = searchParams.has('page') || searchParams.has('limit');
  return { page, limit, skip, enabled };
}

export function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  return {
    page: safePage,
    limit,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}
