import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import { requireIdParam } from '../../utils/params.js';
import * as docService from './document.service.js';

function docId(req: Request): string {
  return requireIdParam(req, 'docId');
}

export const create = catchAsync(async (req: Request, res: Response) => {
  const doc = await docService.createDocument(req.workspaceId!, req.dbUserId!, req.body);
  sendSuccess(res, doc, 201);
});

export const list = catchAsync(async (req: Request, res: Response) => {
  const tree = await docService.buildDocumentTree(req.workspaceId!);
  sendSuccess(res, tree);
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  const doc = await docService.getDocumentById(req.workspaceId!, docId(req));
  if (!doc) throw AppError.notFound('Document not found');
  sendSuccess(res, doc);
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const doc = await docService.updateDocument(req.workspaceId!, docId(req), req.dbUserId!, req.body);
  sendSuccess(res, doc);
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await docService.deleteDocument(req.workspaceId!, docId(req));
  sendSuccess(res, { deleted: true });
});

export const move = catchAsync(async (req: Request, res: Response) => {
  const doc = await docService.moveDocument(
    req.workspaceId!, docId(req), req.body.parent, req.body.order,
  );
  sendSuccess(res, doc);
});

export const reorder = catchAsync(async (req: Request, res: Response) => {
  await docService.reorderDocuments(req.workspaceId!, req.body.orderedIds);
  sendSuccess(res, { reordered: true });
});

export const search = catchAsync(async (req: Request, res: Response) => {
  const q = (req.query['q'] as string) ?? '';
  if (!q.trim()) {
    sendSuccess(res, []);
    return;
  }
  const results = await docService.searchDocuments(req.workspaceId!, q.trim());
  sendSuccess(res, results);
});

// Versions
export const getVersions = catchAsync(async (req: Request, res: Response) => {
  const versions = await docService.getVersions(docId(req));
  sendSuccess(res, versions);
});

export const getVersion = catchAsync(async (req: Request, res: Response) => {
  const versionId = requireIdParam(req, 'versionId');
  const version = await docService.getVersion(docId(req), versionId);
  if (!version) throw AppError.notFound('Version not found');
  sendSuccess(res, version);
});

export const restoreVersion = catchAsync(async (req: Request, res: Response) => {
  const versionId = requireIdParam(req, 'versionId');
  const doc = await docService.restoreVersion(
    req.workspaceId!, docId(req), versionId, req.dbUserId!,
  );
  sendSuccess(res, doc);
});
