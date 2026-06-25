import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import { getParam, requireIdParam } from '../../utils/params.js';
import * as service from './productivity.service.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function requireDate(req: Request): string {
  const date = getParam(req, 'date');
  if (!date || !DATE_REGEX.test(date)) {
    throw AppError.badRequest('Date must be in YYYY-MM-DD format');
  }
  return date;
}

// ─── Pomodoro ────────────────────────────────────────────────────────────────

export const createSession = catchAsync(async (req: Request, res: Response) => {
  if (!req.userId) throw AppError.unauthorized();
  const session = await service.createSession(req.userId, req.body);
  sendSuccess(res, session, 201);
});

export const completeSession = catchAsync(async (req: Request, res: Response) => {
  const sessionId = requireIdParam(req, 'sessionId');
  const session = await service.completeSession(req.userId!, sessionId);
  sendSuccess(res, session);
});

export const listSessions = catchAsync(async (req: Request, res: Response) => {
  const { type, from, to, limit } = req.query as Record<string, string>;
  const sessions = await service.listSessions(req.userId!, {
    type,
    from,
    to,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(res, sessions);
});

export const getStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await service.getStats(req.userId!);
  sendSuccess(res, stats);
});

// ─── Daily Planner ───────────────────────────────────────────────────────────

export const getPlan = catchAsync(async (req: Request, res: Response) => {
  const date = requireDate(req);
  const plan = await service.getPlan(req.userId!, date);
  sendSuccess(res, plan);
});

export const addItem = catchAsync(async (req: Request, res: Response) => {
  const date = requireDate(req);
  const plan = await service.addItem(req.userId!, date, req.body);
  sendSuccess(res, plan, 201);
});

export const updateItem = catchAsync(async (req: Request, res: Response) => {
  const date = requireDate(req);
  const itemId = requireIdParam(req, 'itemId');
  const plan = await service.updateItem(req.userId!, date, itemId, req.body);
  sendSuccess(res, plan);
});

export const removeItem = catchAsync(async (req: Request, res: Response) => {
  const date = requireDate(req);
  const itemId = requireIdParam(req, 'itemId');
  const plan = await service.removeItem(req.userId!, date, itemId);
  sendSuccess(res, plan);
});
