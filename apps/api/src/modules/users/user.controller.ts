import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import * as userService from './user.service.js';

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.findUserByClerkId(req.userId!);
  if (!user) throw AppError.notFound('User not found');
  sendSuccess(res, user);
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.findUserByClerkId(req.userId!);
  if (!user) throw AppError.notFound('User not found');

  const updated = await userService.updateProfile(
    String(user._id),
    req.body,
  );
  sendSuccess(res, updated);
});

export const updateMyPreferences = catchAsync(
  async (req: Request, res: Response) => {
    const user = await userService.findUserByClerkId(req.userId!);
    if (!user) throw AppError.notFound('User not found');

    const updated = await userService.updatePreferences(
      String(user._id),
      req.body,
    );
    sendSuccess(res, updated);
  },
);

export const completeOnboarding = catchAsync(
  async (req: Request, res: Response) => {
    const user = await userService.findUserByClerkId(req.userId!);
    if (!user) throw AppError.notFound('User not found');

    const updated = await userService.markOnboardingComplete(
      String(user._id),
    );
    sendSuccess(res, updated);
  },
);

export const updateAvatar = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.findUserByClerkId(req.userId!);
  if (!user) throw AppError.notFound('User not found');
  const updated = await userService.updateAvatar(String(user._id), req.body.avatarUrl);
  sendSuccess(res, updated);
});

export const removeAvatar = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.findUserByClerkId(req.userId!);
  if (!user) throw AppError.notFound('User not found');
  const updated = await userService.removeAvatar(String(user._id));
  sendSuccess(res, updated);
});

export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteAccount(req.userId!);
  sendSuccess(res, { deleted: true });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const rawUserId = req.params['userId'];
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
  if (!userId) throw AppError.badRequest('User ID is required');

  const user = await userService.findUserById(userId);
  if (!user) throw AppError.notFound('User not found');

  sendSuccess(res, {
    _id: user._id,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    profile: user.profile,
  });
});
