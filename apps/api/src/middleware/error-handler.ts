import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';
import { sendError } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', details);
    return;
  }

  logger.error('Unhandled error', {
    error: err,
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
  });

  sendError(res, 500, 'INTERNAL_ERROR', 'Internal server error');
}
