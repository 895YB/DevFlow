import type { Response } from 'express';
import type { PaginationMeta } from '@devflow/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
): void {
  const response: { success: true; data: T; meta?: PaginationMeta } = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Array<{ field: string; message: string }>,
): void {
  const response: {
    success: false;
    error: {
      code: string;
      message: string;
      details?: Array<{ field: string; message: string }>;
    };
  } = {
    success: false,
    error: { code, message },
  };

  if (details) {
    response.error.details = details;
  }

  res.status(statusCode).json(response);
}
