import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireIdParam } from '../../utils/params.js';
import { taskQuerySchema } from '@devflow/shared';
import * as taskService from './task.service.js';

function taskId(req: Request): string {
  return requireIdParam(req, 'taskId');
}

function projectIdParam(req: Request): string {
  return requireIdParam(req, 'projectId');
}

export const create = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.workspaceId!, projectIdParam(req), req.dbUserId!, req.body);
  sendSuccess(res, task, 201);
});

export const list = catchAsync(async (req: Request, res: Response) => {
  const query = taskQuerySchema.parse(req.query);
  const { tasks, meta } = await taskService.getTasks(req.workspaceId!, projectIdParam(req), query);
  sendSuccess(res, tasks, 200, meta);
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(projectIdParam(req), taskId(req));
  if (!task) {
    throw (await import('../../utils/app-error.js')).AppError.notFound('Task not found');
  }
  sendSuccess(res, task);
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(req.workspaceId!, projectIdParam(req), taskId(req), req.dbUserId!, req.body);
  sendSuccess(res, task);
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.workspaceId!, taskId(req), req.dbUserId!);
  sendSuccess(res, { deleted: true });
});

export const reorder = catchAsync(async (req: Request, res: Response) => {
  await taskService.reorderTasks(req.body.tasks);
  sendSuccess(res, { reordered: true });
});

export const bulkUpdate = catchAsync(async (req: Request, res: Response) => {
  await taskService.bulkUpdateTasks(req.workspaceId!, req.body.taskIds, req.body.update, req.dbUserId!);
  sendSuccess(res, { updated: true });
});

export const addSubtask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.addSubtask(taskId(req), req.workspaceId!, req.dbUserId!, req.body.title);
  sendSuccess(res, task, 201);
});

export const updateSubtask = catchAsync(async (req: Request, res: Response) => {
  const subtaskId = requireIdParam(req, 'subtaskId');
  const task = await taskService.updateSubtask(taskId(req), subtaskId, req.workspaceId!, req.dbUserId!, req.body);
  sendSuccess(res, task);
});

export const deleteSubtask = catchAsync(async (req: Request, res: Response) => {
  const subtaskId = requireIdParam(req, 'subtaskId');
  const task = await taskService.deleteSubtask(taskId(req), subtaskId);
  sendSuccess(res, task);
});

export const reorderSubtasks = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.reorderSubtasks(taskId(req), req.body.orderedIds);
  sendSuccess(res, task);
});

export const getComments = catchAsync(async (req: Request, res: Response) => {
  const comments = await taskService.getComments(taskId(req));
  sendSuccess(res, comments);
});

export const addComment = catchAsync(async (req: Request, res: Response) => {
  const comment = await taskService.addComment(taskId(req), req.workspaceId!, req.dbUserId!, req.body.content, req.body.mentions ?? []);
  sendSuccess(res, comment, 201);
});

export const updateComment = catchAsync(async (req: Request, res: Response) => {
  const commentId = requireIdParam(req, 'commentId');
  const comment = await taskService.updateComment(commentId, req.dbUserId!, req.body.content);
  sendSuccess(res, comment);
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const commentId = requireIdParam(req, 'commentId');
  await taskService.deleteComment(commentId, req.dbUserId!);
  sendSuccess(res, { deleted: true });
});

export const getActivities = catchAsync(async (req: Request, res: Response) => {
  const activities = await taskService.getActivities(taskId(req));
  sendSuccess(res, activities);
});
