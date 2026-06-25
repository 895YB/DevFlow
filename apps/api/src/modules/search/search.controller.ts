import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import * as searchService from './search.service.js';

export const search = catchAsync(async (req: Request, res: Response) => {
  const q = String(req.query['q'] ?? '').trim();
  if (!q || q.length < 2) throw AppError.badRequest('Query must be at least 2 characters');
  if (q.length > 100) throw AppError.badRequest('Query too long');

  const results = await searchService.globalSearch(req.workspaceId!, q);
  sendSuccess(res, results);
});
