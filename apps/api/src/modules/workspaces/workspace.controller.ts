import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import { requireIdParam } from '../../utils/params.js';
import { findUserByClerkId } from '../users/user.service.js';
import * as workspaceService from './workspace.service.js';
import * as auditService from '../audit-log/audit-log.service.js';

export const create = catchAsync(async (req: Request, res: Response) => {
  const user = await findUserByClerkId(req.userId!);
  if (!user) throw AppError.unauthorized();

  const { workspace, member } = await workspaceService.createWorkspace(
    String(user._id),
    req.body,
  );

  auditService.logAction({
    workspace: String(workspace._id),
    user: String(user._id),
    action: 'created',
    entity: { type: 'workspace', id: String(workspace._id), name: workspace.name },
    req,
  });

  sendSuccess(res, { workspace, member }, 201);
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  const workspace = await workspaceService.getWorkspaceById(req.workspaceId!);
  if (!workspace) throw AppError.notFound('Workspace not found');
  sendSuccess(res, workspace);
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const workspace = await workspaceService.updateWorkspace(req.workspaceId!, req.body);

  auditService.logAction({
    workspace: req.workspaceId!,
    user: req.dbUserId!,
    action: 'updated',
    entity: { type: 'workspace', id: req.workspaceId!, name: workspace.name },
    details: req.body,
    req,
  });

  sendSuccess(res, workspace);
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await workspaceService.deleteWorkspace(req.workspaceId!);

  auditService.logAction({
    workspace: req.workspaceId!,
    user: req.dbUserId!,
    action: 'deleted',
    entity: { type: 'workspace', id: req.workspaceId!, name: '' },
    req,
  });

  sendSuccess(res, { deleted: true });
});

export const getMyWorkspaces = catchAsync(async (req: Request, res: Response) => {
  const user = await findUserByClerkId(req.userId!);
  if (!user) {
    sendSuccess(res, []);
    return;
  }
  const workspaces = await workspaceService.getUserWorkspaces(String(user._id));
  sendSuccess(res, workspaces);
});

export const getMembers = catchAsync(async (req: Request, res: Response) => {
  const members = await workspaceService.getMembers(req.workspaceId!);
  sendSuccess(res, members);
});

export const inviteMember = catchAsync(async (req: Request, res: Response) => {
  const { email, role } = req.body;

  const member = await workspaceService.inviteMember(
    req.workspaceId!, email, role, req.dbUserId!,
  );

  auditService.logAction({
    workspace: req.workspaceId!,
    user: req.dbUserId!,
    action: 'member_added',
    entity: { type: 'member', id: String(member._id), name: email },
    details: { role },
    req,
  });

  sendSuccess(res, member, 201);
});

export const updateMemberRole = catchAsync(async (req: Request, res: Response) => {
  const memberId = requireIdParam(req, 'memberId');

  const member = await workspaceService.updateMemberRole(
    req.workspaceId!, memberId, req.body.role,
  );

  auditService.logAction({
    workspace: req.workspaceId!,
    user: req.dbUserId!,
    action: 'role_changed',
    entity: { type: 'member', id: memberId, name: '' },
    details: { newRole: req.body.role },
    req,
  });

  sendSuccess(res, member);
});

export const removeMember = catchAsync(async (req: Request, res: Response) => {
  const memberId = requireIdParam(req, 'memberId');
  await workspaceService.removeMember(req.workspaceId!, memberId);

  auditService.logAction({
    workspace: req.workspaceId!,
    user: req.dbUserId!,
    action: 'member_removed',
    entity: { type: 'member', id: memberId, name: '' },
    req,
  });

  sendSuccess(res, { deleted: true });
});

export const leave = catchAsync(async (req: Request, res: Response) => {
  await workspaceService.leaveWorkspace(req.workspaceId!, req.dbUserId!);
  sendSuccess(res, { deleted: true });
});
