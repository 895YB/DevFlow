import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import * as service from './activity.service.js';

export const list = catchAsync(async (req: Request, res: Response) => {
  const { cursor, limit } = req.query as Record<string, string>;
  const result = await service.listActivity(req.workspaceId!, {
    cursor,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(res, result);
});
