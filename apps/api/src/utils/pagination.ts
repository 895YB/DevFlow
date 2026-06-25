import type { PaginationMeta } from '@devflow/shared';

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface PaginationResult {
  skip: number;
  limit: number;
  page: number;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export function parsePagination(options: PaginationOptions): PaginationResult {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, options.limit ?? DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  return { skip, limit, page };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
