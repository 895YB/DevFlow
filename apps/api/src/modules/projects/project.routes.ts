import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireWorkspaceAccess } from '../../middleware/workspace-access.js';
import { validate } from '../../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  createStatusSchema,
  updateStatusSchema,
  reorderSchema,
  createLabelSchema,
  updateLabelSchema,
} from '@devflow/shared';
import * as controller from './project.controller.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', requireWorkspaceAccess('member'), validate(createProjectSchema), controller.create);
router.get('/', requireWorkspaceAccess('viewer'), controller.list);
router.get('/:projectId', requireWorkspaceAccess('viewer'), controller.getById);
router.patch('/:projectId', requireWorkspaceAccess('member'), validate(updateProjectSchema), controller.update);
router.delete('/:projectId', requireWorkspaceAccess('admin'), controller.remove);

router.post('/:projectId/statuses', requireWorkspaceAccess('admin'), validate(createStatusSchema), controller.addStatus);
router.patch('/:projectId/statuses/reorder', requireWorkspaceAccess('admin'), validate(reorderSchema), controller.reorderStatuses);
router.patch('/:projectId/statuses/:statusId', requireWorkspaceAccess('admin'), validate(updateStatusSchema), controller.updateStatus);
router.delete('/:projectId/statuses/:statusId', requireWorkspaceAccess('admin'), controller.deleteStatus);

router.post('/:projectId/labels', requireWorkspaceAccess('admin'), validate(createLabelSchema), controller.addLabel);
router.patch('/:projectId/labels/:labelId', requireWorkspaceAccess('admin'), validate(updateLabelSchema), controller.updateLabel);
router.delete('/:projectId/labels/:labelId', requireWorkspaceAccess('admin'), controller.deleteLabel);

export default router;
