import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import { requireIdParam } from '../../utils/params.js';
import * as service from './api-tester.service.js';

// ─── Proxy ───────────────────────────────────────────────────────────────────

export const proxy = catchAsync(async (req: Request, res: Response) => {
  if (!req.userId) throw AppError.unauthorized();
  const result = await service.executeProxy(req.userId, req.body);
  sendSuccess(res, result);
});

// ─── Collections ─────────────────────────────────────────────────────────────

export const listCollections = catchAsync(async (req: Request, res: Response) => {
  const collections = await service.listCollections(req.userId!);
  sendSuccess(res, collections);
});

export const getCollection = catchAsync(async (req: Request, res: Response) => {
  const collectionId = requireIdParam(req, 'collectionId');
  const collection = await service.getCollectionById(req.userId!, collectionId);
  sendSuccess(res, collection);
});

export const createCollection = catchAsync(async (req: Request, res: Response) => {
  const collection = await service.createCollection(req.userId!, req.body);
  sendSuccess(res, collection, 201);
});

export const updateCollection = catchAsync(async (req: Request, res: Response) => {
  const collectionId = requireIdParam(req, 'collectionId');
  const collection = await service.updateCollection(req.userId!, collectionId, req.body);
  sendSuccess(res, collection);
});

export const deleteCollection = catchAsync(async (req: Request, res: Response) => {
  const collectionId = requireIdParam(req, 'collectionId');
  await service.deleteCollection(req.userId!, collectionId);
  sendSuccess(res, { deleted: true });
});

// ─── Requests ────────────────────────────────────────────────────────────────

export const addRequest = catchAsync(async (req: Request, res: Response) => {
  const collectionId = requireIdParam(req, 'collectionId');
  const collection = await service.addRequest(req.userId!, collectionId, req.body);
  sendSuccess(res, collection, 201);
});

export const updateRequest = catchAsync(async (req: Request, res: Response) => {
  const collectionId = requireIdParam(req, 'collectionId');
  const requestId = requireIdParam(req, 'requestId');
  const collection = await service.updateRequest(req.userId!, collectionId, requestId, req.body);
  sendSuccess(res, collection);
});

export const deleteRequest = catchAsync(async (req: Request, res: Response) => {
  const collectionId = requireIdParam(req, 'collectionId');
  const requestId = requireIdParam(req, 'requestId');
  const collection = await service.deleteRequest(req.userId!, collectionId, requestId);
  sendSuccess(res, collection);
});

// ─── Environments ─────────────────────────────────────────────────────────────

export const listEnvironments = catchAsync(async (req: Request, res: Response) => {
  const environments = await service.listEnvironments(req.userId!);
  sendSuccess(res, environments);
});

export const createEnvironment = catchAsync(async (req: Request, res: Response) => {
  const environment = await service.createEnvironment(req.userId!, req.body);
  sendSuccess(res, environment, 201);
});

export const updateEnvironment = catchAsync(async (req: Request, res: Response) => {
  const envId = requireIdParam(req, 'envId');
  const environment = await service.updateEnvironment(req.userId!, envId, req.body);
  sendSuccess(res, environment);
});

export const deleteEnvironment = catchAsync(async (req: Request, res: Response) => {
  const envId = requireIdParam(req, 'envId');
  await service.deleteEnvironment(req.userId!, envId);
  sendSuccess(res, { deleted: true });
});

export const activateEnvironment = catchAsync(async (req: Request, res: Response) => {
  const envId = requireIdParam(req, 'envId');
  const environment = await service.activateEnvironment(req.userId!, envId);
  sendSuccess(res, environment);
});

// ─── History ──────────────────────────────────────────────────────────────────

export const getHistory = catchAsync(async (req: Request, res: Response) => {
  const history = await service.getHistory(req.userId!);
  sendSuccess(res, history);
});

export const clearHistory = catchAsync(async (req: Request, res: Response) => {
  await service.clearHistory(req.userId!);
  sendSuccess(res, { deleted: true });
});
