import { Notification, type INotification } from './notification.model.js';
import { AppError } from '../../utils/app-error.js';
import { logger } from '../../utils/logger.js';
import type { NotificationType } from '@devflow/shared';

const PAGE_SIZE = 20;

export async function createNotification(input: {
  userId: string;
  workspaceId?: string | null;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
}): Promise<INotification> {
  const notification = await Notification.create({
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    type: input.type,
    title: input.title,
    message: input.message ?? '',
    link: input.link ?? '',
  });

  try {
    const { getIO } = await import('../../config/socket.js');
    getIO()
      .to(`user:${input.userId}`)
      .emit('notification:new', {
        _id: String(notification._id),
        userId: notification.userId,
        workspaceId: notification.workspaceId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      });
  } catch {
    logger.warn('Socket not initialized — skipping real-time notification emit');
  }

  return notification;
}

export async function listNotifications(
  userId: string,
  params: { unreadOnly?: boolean; cursor?: string; limit?: number },
): Promise<{ notifications: INotification[]; hasMore: boolean }> {
  const limit = Math.min(params.limit ?? PAGE_SIZE, 100);
  const filter: Record<string, unknown> = { userId };
  if (params.unreadOnly) filter['read'] = false;
  if (params.cursor) filter['_id'] = { $lt: params.cursor };

  const rows = await Notification.find(filter).sort({ createdAt: -1 }).limit(limit + 1);
  const hasMore = rows.length > limit;
  return { notifications: hasMore ? rows.slice(0, limit) : rows, hasMore };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ userId, read: false });
}

export async function markRead(userId: string, id: string): Promise<INotification> {
  const n = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { read: true } },
    { new: true },
  );
  if (!n) throw AppError.notFound('Notification not found');
  return n;
}

export async function markAllRead(userId: string): Promise<void> {
  await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
}

export async function deleteNotification(userId: string, id: string): Promise<void> {
  const result = await Notification.findOneAndDelete({ _id: id, userId });
  if (!result) throw AppError.notFound('Notification not found');
}
