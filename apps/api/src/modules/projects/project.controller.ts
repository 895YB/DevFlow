import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import { requireIdParam } from '../../utils/params.js';
import * as projectService from './project.service.js';

function projectId(req: Request): string {
  return requireIdParam(req, 'projectId');
}

export const create = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.workspaceId!, req.dbUserId!, req.body);
  sendSuccess(res, project, 201);
});

export const list = catchAsync(async (req: Request, res: Response) => {
  const projects = await projectService.getProjects(req.workspaceId!);
  sendSuccess(res, projects);
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.workspaceId!, projectId(req));
  if (!project) throw AppError.notFound('Project not found');
  sendSuccess(res, project);
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.updateProject(req.workspaceId!, projectId(req), req.body);
  sendSuccess(res, project);
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await projectService.deleteProject(req.workspaceId!, projectId(req));
  sendSuccess(res, { deleted: true });
});

export const addStatus = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.addStatus(req.workspaceId!, projectId(req), req.body);
  sendSuccess(res, project, 201);
});

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const statusId = requireIdParam(req, 'statusId');
  const project = await projectService.updateStatus(req.workspaceId!, projectId(req), statusId, req.body);
  sendSuccess(res, project);
});

export const deleteStatus = catchAsync(async (req: Request, res: Response) => {
  const statusId = requireIdParam(req, 'statusId');
  const project = await projectService.deleteStatus(req.workspaceId!, projectId(req), statusId);
  sendSuccess(res, project);
});

export const reorderStatuses = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.reorderStatuses(req.workspaceId!, projectId(req), req.body.orderedIds);
  sendSuccess(res, project);
});

export const addLabel = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.addLabel(req.workspaceId!, projectId(req), req.body);
  sendSuccess(res, project, 201);
});

export const updateLabel = catchAsync(async (req: Request, res: Response) => {
  const labelId = requireIdParam(req, 'labelId');
  const project = await projectService.updateLabel(req.workspaceId!, projectId(req), labelId, req.body);
  sendSuccess(res, project);
});

export const deleteLabel = catchAsync(async (req: Request, res: Response) => {
  const labelId = requireIdParam(req, 'labelId');
  const project = await projectService.deleteLabel(req.workspaceId!, projectId(req), labelId);
  sendSuccess(res, project);
});
