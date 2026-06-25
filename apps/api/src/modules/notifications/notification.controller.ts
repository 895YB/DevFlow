import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireIdParam } from '../../utils/params.js';
import * as service from './notification.service.js';

export const list = catchAsync(async (req: Request, res: Response) => {
  const { unreadOnly, cursor, limit } = req.query as Record<string, string>;
  const result = await service.listNotifications(req.userId!, {
    unreadOnly: unreadOnly === 'true',
    cursor,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(res, result);
});

export const unreadCount = catchAsync(async (req: Request, res: Response) => {
  const count = await service.getUnreadCount(req.userId!);
  sendSuccess(res, { count });
});

export const markRead = catchAsync(async (req: Request, res: Response) => {
  const id = requireIdParam(req, 'id');
  const notification = await service.markRead(req.userId!, id);
  sendSuccess(res, notification);
});

export const markAllRead = catchAsync(async (req: Request, res: Response) => {
  await service.markAllRead(req.userId!);
  sendSuccess(res, { success: true });
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  const id = requireIdParam(req, 'id');
  await service.deleteNotification(req.userId!, id);
  sendSuccess(res, { deleted: true });
});
