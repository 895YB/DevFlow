import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireIdParam } from '../../utils/params.js';
import { createChannelSchema, editMessageSchema } from '@devflow/shared';
import * as service from './chat.service.js';

export const listChannels = catchAsync(async (req: Request, res: Response) => {
  const channels = await service.listChannels(req.workspaceId!);
  sendSuccess(res, channels);
});

export const createChannel = catchAsync(async (req: Request, res: Response) => {
  const input = createChannelSchema.parse(req.body);
  const channel = await service.createChannel(req.workspaceId!, req.userId!, input);
  sendSuccess(res, channel, 201);
});

export const ensureGeneral = catchAsync(async (req: Request, res: Response) => {
  const channel = await service.ensureGeneralChannel(req.workspaceId!, req.userId!);
  sendSuccess(res, channel);
});

export const deleteChannel = catchAsync(async (req: Request, res: Response) => {
  const channelId = requireIdParam(req, 'channelId');
  await service.deleteChannel(req.workspaceId!, channelId);
  sendSuccess(res, { deleted: true });
});

export const listMessages = catchAsync(async (req: Request, res: Response) => {
  const channelId = requireIdParam(req, 'channelId');
  const { cursor, limit } = req.query as Record<string, string>;
  const result = await service.listMessages(req.workspaceId!, channelId, {
    cursor,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(res, result);
});

export const editMessage = catchAsync(async (req: Request, res: Response) => {
  const channelId = requireIdParam(req, 'channelId');
  const messageId = requireIdParam(req, 'messageId');
  const { content } = editMessageSchema.parse(req.body);
  // Ensure channel belongs to workspace
  await service.getChannelById(req.workspaceId!, channelId);
  const message = await service.editMessage(req.workspaceId!, messageId, req.userId!, content);
  sendSuccess(res, message);
});

export const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const channelId = requireIdParam(req, 'channelId');
  const messageId = requireIdParam(req, 'messageId');
  await service.getChannelById(req.workspaceId!, channelId);
  await service.deleteMessage(req.workspaceId!, messageId, req.userId!);
  sendSuccess(res, { deleted: true });
});
