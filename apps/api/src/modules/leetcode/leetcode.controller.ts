import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import { requireIdParam } from '../../utils/params.js';
import * as leetcodeService from './leetcode.service.js';

export const connect = catchAsync(async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) throw AppError.badRequest('LeetCode username is required');

  const profile = await leetcodeService.connectLeetCode(req.dbUserId!, username);
  sendSuccess(res, profile, 201);
});

export const disconnect = catchAsync(async (req: Request, res: Response) => {
  await leetcodeService.disconnectLeetCode(req.dbUserId!);
  sendSuccess(res, { deleted: true });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const profile = await leetcodeService.getProfile(req.dbUserId!);
  if (!profile) {
    sendSuccess(res, { connected: false });
    return;
  }
  sendSuccess(res, profile);
});

export const sync = catchAsync(async (req: Request, res: Response) => {
  const profile = await leetcodeService.syncProfile(req.dbUserId!);
  sendSuccess(res, profile);
});

export const getSubmissions = catchAsync(async (req: Request, res: Response) => {
  const profile = await leetcodeService.getProfile(req.dbUserId!);
  if (!profile) throw AppError.notFound('LeetCode not connected');
  sendSuccess(res, profile.recentSubmissions);
});

export const getContests = catchAsync(async (req: Request, res: Response) => {
  const profile = await leetcodeService.getProfile(req.dbUserId!);
  if (!profile) throw AppError.notFound('LeetCode not connected');
  sendSuccess(res, profile.contests);
});

export const addEntry = catchAsync(async (req: Request, res: Response) => {
  const profile = await leetcodeService.addManualEntry(req.dbUserId!, req.body);
  sendSuccess(res, profile, 201);
});

export const deleteEntry = catchAsync(async (req: Request, res: Response) => {
  const entryId = requireIdParam(req, 'entryId');
  const profile = await leetcodeService.deleteManualEntry(req.dbUserId!, entryId);
  sendSuccess(res, profile);
});
