import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import * as analyticsService from './analytics.service.js';
import type { AnalyticsPeriod } from '@devflow/shared';

const VALID_PERIODS: AnalyticsPeriod[] = ['7d', '30d', '90d'];

export const getAnalytics = catchAsync(async (req: Request, res: Response) => {
  const rawPeriod = (req.query['period'] as string) ?? '30d';
  if (!VALID_PERIODS.includes(rawPeriod as AnalyticsPeriod)) {
    throw AppError.badRequest(`Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}`);
  }
  const period = rawPeriod as AnalyticsPeriod;
  const data = await analyticsService.getAnalytics(req.workspaceId!, req.userId!, period);
  sendSuccess(res, data);
});
