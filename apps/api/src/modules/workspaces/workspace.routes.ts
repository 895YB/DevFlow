import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireWorkspaceAccess } from '../../middleware/workspace-access.js';
import { validate } from '../../middleware/validate.js';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '@devflow/shared';
import * as workspaceController from './workspace.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createWorkspaceSchema), workspaceController.create);
router.get('/me', workspaceController.getMyWorkspaces);

router.get('/:workspaceId', requireWorkspaceAccess('viewer'), workspaceController.getById);
router.patch('/:workspaceId', requireWorkspaceAccess('admin'), validate(updateWorkspaceSchema), workspaceController.update);
router.delete('/:workspaceId', requireWorkspaceAccess('owner'), workspaceController.remove);

router.get('/:workspaceId/members', requireWorkspaceAccess('viewer'), workspaceController.getMembers);
router.post('/:workspaceId/members/invite', requireWorkspaceAccess('admin'), validate(inviteMemberSchema), workspaceController.inviteMember);
router.patch('/:workspaceId/members/:memberId', requireWorkspaceAccess('admin'), validate(updateMemberRoleSchema), workspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:memberId', requireWorkspaceAccess('admin'), workspaceController.removeMember);
router.post('/:workspaceId/members/leave', requireWorkspaceAccess('viewer'), workspaceController.leave);

export default router;
