import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.js';
import { requireIdParam } from '../utils/params.js';
import * as workspaceService from '../modules/workspaces/workspace.service.js';
import { findUserByClerkId } from '../modules/users/user.service.js';
import { ROLE_HIERARCHY, type WorkspaceRole } from '@devflow/shared';

export function requireWorkspaceAccess(minRole: WorkspaceRole = 'viewer') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = requireIdParam(req, 'workspaceId');

      const workspace = await workspaceService.getWorkspaceById(workspaceId);
      if (!workspace) {
        next(AppError.notFound('Workspace not found'));
        return;
      }

      const user = await findUserByClerkId(req.userId!);
      if (!user) {
        next(AppError.unauthorized());
        return;
      }

      const membership = await workspaceService.getMembership(
        workspaceId,
        String(user._id),
      );
      if (!membership) {
        next(AppError.forbidden('You are not a member of this workspace'));
        return;
      }

      if (ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY[minRole]) {
        next(AppError.forbidden('Insufficient permissions'));
        return;
      }

      req.workspaceId = workspaceId;
      req.dbUserId = String(user._id);
      req.workspaceMembership = {
        role: membership.role,
        memberId: String(membership._id),
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}
