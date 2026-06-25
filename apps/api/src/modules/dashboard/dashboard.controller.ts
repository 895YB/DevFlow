import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import * as dashboardService from './dashboard.service.js';

export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const data = await dashboardService.getDashboardData(req.workspaceId!, req.dbUserId!);
  sendSuccess(res, data);
});
