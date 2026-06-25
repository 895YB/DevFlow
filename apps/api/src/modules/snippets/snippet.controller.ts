import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import { requireIdParam } from '../../utils/params.js';
import { snippetQuerySchema } from '@devflow/shared';
import * as snippetService from './snippet.service.js';

function snippetId(req: Request): string {
  return requireIdParam(req, 'snippetId');
}

export const create = catchAsync(async (req: Request, res: Response) => {
  const snippet = await snippetService.createSnippet(req.workspaceId!, req.dbUserId!, req.body);
  sendSuccess(res, snippet, 201);
});

export const list = catchAsync(async (req: Request, res: Response) => {
  const query = snippetQuerySchema.parse(req.query);
  const { snippets, meta } = await snippetService.getSnippets(req.workspaceId!, req.dbUserId!, query);
  sendSuccess(res, snippets, 200, meta);
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  const snippet = await snippetService.getSnippetById(req.workspaceId!, snippetId(req));
  if (!snippet) throw AppError.notFound('Snippet not found');
  sendSuccess(res, snippet);
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const snippet = await snippetService.updateSnippet(req.workspaceId!, snippetId(req), req.body);
  sendSuccess(res, snippet);
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await snippetService.deleteSnippet(req.workspaceId!, snippetId(req));
  sendSuccess(res, { deleted: true });
});

export const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
  const snippet = await snippetService.toggleFavorite(req.workspaceId!, snippetId(req), req.dbUserId!);
  sendSuccess(res, snippet);
});

// Folders
export const createFolder = catchAsync(async (req: Request, res: Response) => {
  const folder = await snippetService.createFolder(req.workspaceId!, req.dbUserId!, req.body);
  sendSuccess(res, folder, 201);
});

export const listFolders = catchAsync(async (req: Request, res: Response) => {
  const folders = await snippetService.getFolders(req.workspaceId!);
  sendSuccess(res, folders);
});

export const updateFolder = catchAsync(async (req: Request, res: Response) => {
  const folderId = requireIdParam(req, 'folderId');
  const folder = await snippetService.updateFolder(req.workspaceId!, folderId, req.body);
  sendSuccess(res, folder);
});

export const deleteFolder = catchAsync(async (req: Request, res: Response) => {
  const folderId = requireIdParam(req, 'folderId');
  await snippetService.deleteFolder(req.workspaceId!, folderId);
  sendSuccess(res, { deleted: true });
});
